import os
import asyncio
from threading import Thread
from dotenv import load_dotenv
from functools import wraps
from flask import Flask, jsonify, request, make_response
from flask_caching import Cache
from bot import Bot
from db import DB
import controller

load_dotenv("./.env")
# credentials
TMI_TOKEN = os.environ.get('TMI_TOKEN')
CLIENT_ID = os.environ.get('CLIENT_ID')
BOT_NICK = os.environ.get('BOT_NICK')
BOT_PREFIX = os.environ.get('BOT_PREFIX')
CHANNELS = os.environ.get('CHANNEL').split(",")
EMAIL = os.environ.get('EMAIL')
PASSWORD = os.environ.get('PASSWORD')
ADMIN_USER = os.environ.get('ADMIN_USER')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASS')
DB_USER = os.environ.get('DB_USER')
DB_PASS = os.environ.get('DB_PASS')

app = Flask(__name__, static_folder="client/build", static_url_path='/')
app.config['CACHE_TYPE'] = "SimpleCache"
cache = Cache(app)

db = DB(DB_USER, DB_PASS)

botThread = None
isBotReady = False
threadStarted = False


def authorize(f):
    @wraps(f)
    def decorated_function(*args, **kws):
        if request.authorization and request.authorization.username == ADMIN_USER and request.authorization.password == ADMIN_PASSWORD:
            return f(*args, **kws)
        else:
            return make_response('Could not verify!', 401, {'WWW-Authenticate': 'Basic realm="Login Required"'})
    return decorated_function


@ app.route('/')
def index():
    return app.send_static_file('index.html')


@ app.route("/web/<channelName>")
def getChannelView(channelName):
    """
        return the template with the channel name
        in js store data locally
    """
    return app.send_static_file('index.html')


@ app.route('/start')
def startBot():
    """Start the TwitchIo bot and LogInto Codingame

    Returns:
        json: with Status of bot i.e. 200 if running or 202 if creating
    """
    global botThread
    if botThread is not None and isBotReady:
        return jsonify({"status": 200, "message": "Bot Running."})

    if botThread is None and not threadStarted:
        botThread = Thread(target=handleBot, daemon=True)
        botThread.start()
        controller.login(EMAIL, PASSWORD)

    return jsonify({"status": 202, "message": "Starting bot..."})


@ app.route("/api/report/<matchId>")  # Show Specific
def getReport(matchId):
    """Gets full report of match

    Args:
        matchId (str): matchId to get report of.

    Returns:
        json: full report as it is from codingame of given `matchId`
    """
    report = controller.getReport(matchId)
    return jsonify({"status": 200 if report else 500, "message": report or "ERROR!!!"})


@ cache.memoize(timeout=5)
def getReportFromController(matchId):
    """ Get report from codingame, Memoized to reduce outgoing requests"""
    return controller.getReport(matchId)


@app.route("/view")
@authorize
def viewCurrent():
    """ADMIN ONLY: Show all of users

    Returns:
        json: all data of users Match
    """
    return jsonify({"status": 200, "message": db.getAll()})


@ app.route("/set/<channelName>/<matchId>")
@authorize
def setManual(channelName, matchId):
    """ADMIN ONLY: Manually sets currentMatch of `channelNamer

    Args:
        channelName (str): channelName
        matchId (str): new MatchId to be set

    Returns:
        json: shows channelName info
    """
    cancelPrev = request.args.get("cancel")
    if cancelPrev:
        db.cancleMatch(matchId)

    db.addNewMatch(channelName, matchId)

    return jsonify({"status": 200, "message": db.getMatchInfo(channelName)})


@app.route("/api/prev/<channelName>")
def getPrev(channelName):
    info = db.getMatchInfo(channelName)
    if not info:
        return jsonify([])
    op = []
    for match in info.get('prevMatches'):
        m = controller.getReport(match)
        w = m['players'][0]
        o = {"matchId": match, "winner": {
            "name": w['codingamerNickname'],
            "avatarId": w.get('codingamerAvatarId', None),
            "rank": w['rank'], "duration": w["duration"], "language": w["languageId"]}}
        op.append(o)
    return jsonify(op)


@ app.route("/api/<channelName>")
def getDetail(channelName):
    """
        return current Match detail
    """
    channelName = channelName.lower()
    info = db.getMatchInfo(channelName)
    matchId = info.get("currentMatch")
    if channelName == "" or not info or matchId == "":
        return jsonify({"status": 404, "message": "Not Found!!!"})

    report = getReportFromController(matchId)
    isStarted = report['started']

    ret = {"status": 200, "started": isStarted,
           "matchId": matchId,
           "noPlayers": len(report["players"])-1, "players": []}

    if isStarted:
        ret['mode'] = report['mode']
        ret['msBeforeEnd'] = report['msBeforeEnd']
        ret['finished'] = report['finished']

    for player in report["players"]:
        # Don't Put bots data
        if player["codingamerNickname"] == "SkyCOCBot":
            continue

        pInfo = {
            "name": player['codingamerNickname'],
            "avatarId": player.get('codingamerAvatarId', None)
        }

        if isStarted:
            isCompleted = player['testSessionStatus'] == "COMPLETED"
            pInfo["finished"] = isCompleted

            if isCompleted:
                pInfo['rank'] = player['rank']
                pInfo['duration'] = player['duration']
                pInfo['language'] = player['languageId']

        ret["players"].append(pInfo)

    return jsonify(ret)


def handle_onBotReady():
    """ To set isbotReady flag"""
    global isBotReady
    isBotReady = True


def handle_onCoc(ctx):
    """Handle COC command that only works if called by Mod

    Args:
        ctx (Contex): Contex

    Returns:
        str: String to send back to Chat
    """
    msg = ctx.message.content  # message
    options = msg.split()   # split msg to find any options
    chName = ctx.channel.name.lower()  # name of the channel used as key in dict
    info = db.getMatchInfo(chName)    # current Match if any
    matchId = "" if not info else info.get(
        "currentMatch")  # if match then get current Match

    if len(options) == 2:
        # Check if `reset` or `cancle` or 'c' flag is set
        if options[1].lower() in ["reset", "cancel", "c"]:
            # if no match is running
            if matchId == "":
                return "No Clash Running to cancel!!"

            # Leave that match and Remove from DB
            controller.leaveCurrentClash(matchId)
            db.cancleMatch(chName)

            return "Current Clashed Cancled!!! "

    # if already match exits Start if not Started
    if matchId != "":
        data = controller.getReport(matchId)
        if data['started'] == False:
            controller.startMatch(matchId)
            return f"Starting with {str(len(data['players']) - 1)} Players"

    # Create New Match if No Match or Match was already started
    # get modes from options
    modes = ["FASTEST", "SHORTEST", "REVERSE"]
    selectedModes = []
    if len(options) == 2:
        ops = [o.lower() for o in options[1:]]  # get options
        for op in ops:
            if op in ["f", "fast", "fastest"]:
                selectedModes.append(modes[0])
            elif op in ["s", "short", "shortest"]:
                selectedModes.append(modes[1])
            elif op in ["r", "reverse"]:
                selectedModes.append(modes[2])

    # if no mode selected then set to default
    if len(selectedModes) == 0:
        selectedModes = modes
    # create Private looby
    res = controller.createPrivateMatch(modes=selectedModes)
    db.addNewMatch(chName, res.split("/")[-1])
    return res


def handle_onLink(ctx):
    """Return link of the current Match according to channelName

    Args:
        ctx (Context): TwitchIO context object

    Returns:
        str | None: link of current match
    """
    return controller.getCurrentClash(db.getMatchInfo(ctx.channel.name))


def handleBot():
    """Handles the bot starting procedure
    """
    global threadStarted
    if threadStarted:
        print("ERROR|", "Bot Already Running")
        return
    # create new async Loop for boot
    asyncio.set_event_loop(asyncio.new_event_loop())
    # loop = asyncio.get_event_loop()
    bot = Bot(TMI_TOKEN, CLIENT_ID, BOT_NICK, BOT_PREFIX, CHANNELS)
    bot.on_ready = handle_onBotReady
    bot.on_coc = handle_onCoc
    bot.on_link = handle_onLink
    threadStarted = True
    bot.run()
    # loop.create_task(bot.start())


if __name__ == "__main__":
    app.run()

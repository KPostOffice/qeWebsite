from config import structure, cards, tests, collection, deconstruct_time, sheetService, driveService, pp
from auth import authorize
import re
import datetime
from sheet import Sheet
from pymongo import  UpdateOne
import time

# TODO: Construct search for sheetsAPI
def genSearchString(card, test, year, month):
    return "name contains " + "'" + card + "_" + test + "_" + str(year) + "_" + str(month).zfill(2) + "'"

''' This function takes the file name and generates the epoch time so that the
    the database can be more easily sorted in relation to time'''
def getEpochTime(fileName):
    match = re.match(deconstruct_time, fileName)
    (yr, mon, day, hr, min, sec) = match.groups()
    fileTime = datetime.datetime(int(yr),int(mon),int(day),int(hr),int(min),int(sec))
    epoch = datetime.datetime.utcfromtimestamp(0)
    return int((fileTime - epoch).total_seconds())



def runUpdate(monthStart, yearStart, monthEnd, yearEnd):

    curMonth = monthStart
    curYear = yearStart

    updateList = []

    while(curYear<yearEnd or (curYear==yearEnd and curMonth<=monthEnd)):
        for card in cards:
            for test in tests:
                search = genSearchString(card, test, curYear, curMonth)
                print(search)
                results = driveService.files().list( includeTeamDriveItems=True,
                                                     supportsTeamDrives=True, pageSize=100, q=search, corpora='domain').execute()
                files = results["files"]
                for file in files:
                    datetime = getEpochTime(file["name"])
                    curSheet = Sheet(test, card, datetime, file["id"])
                    updateList = updateList + curSheet.genUpdate(sheetService)
                    time.sleep(1.5)

        curYear = curYear + 1 if curMonth == 12 else curYear
        curMonth = (curMonth%12) + 1

    query = []
    for update in updateList:
        pp.pprint(update)
        query.append(UpdateOne(
            {
                "sheetId": update['sheetId'],
                "subtest": update['subtest'],
                "type": update['test']
            }, {"$set":update}, upsert=True))
    
    collection.bulk_write(query)

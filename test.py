from config import structure
from sub_test import Subtest
from config import pp
import re

class Test:

    def __init__(self, name):
        self.name = name
        self.subtests = self.generatesubtests(name)

    def generatesubtests(self, testName):
        test = structure["tests"][testName]
        subtests = []
        for subtest in test.keys():
            for type in test[subtest].keys():
                subtests.append(Subtest(subtest, type, test[subtest][type]))
        return subtests


    def genUpdate(self, sheetId, gapi):
        update = []
        labels = []
        batchReq = []
        sheets = [i["properties"]["title"] for i in gapi.spreadsheets().get(spreadsheetId = sheetId).execute()["sheets"]]
        for subtest in self.subtests:
            if(subtest.name in sheets):
                update.append(subtest.genUpdate())
                (lab,req) = subtest.getBatch()
                labels.append(lab)
                batchReq = batchReq + req

        info = gapi.spreadsheets().values().batchGet(spreadsheetId = sheetId,
                                                     ranges = batchReq).execute()

        info = info["valueRanges"]

        locData = 0
        locUpdate = 0

        for group in labels:
            data = {}
            for label in group:
                if "values" in info[locData]:
                    if re.match('\d+\.?\d*$', info[locData]["values"][0][0]):
                        data[label] = float(info[locData]["values"][0][0])

                locData += 1

            update[locUpdate]["data"] = data
            update[locUpdate]["test"] = self.name
            locUpdate += 1

        return update

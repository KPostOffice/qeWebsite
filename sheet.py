from test import Test

class Sheet:
    def __init__(self, testName, cardName, datetime, sheetId):
        self.test = Test(testName)
        self.cardName = cardName
        self.datetime = datetime
        self.sheetId = sheetId

    def genUpdate(self,gapi):
        updateList = self.test.genUpdate(self.sheetId, gapi)
        for update in updateList:
            update['cardName'] = self.cardName
            update['datetime'] = self.datetime
            update['sheetId'] = self.sheetId

        return updateList

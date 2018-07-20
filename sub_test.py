from auth import authorize
from config import pp
import time

class Subtest(dict):
    def __init__(self, name, type, locations):
        self.locations = locations
        self.name = name
        self.type = type

    def getBatch(self):
        labels = []
        req = []
        for k,v in self.locations.items():
            req.append(self.name+v)
            labels.append(k)
        return (labels, req)

    def genUpdate(self):
        genUpdate = dict()
        genUpdate["subtest"] = self.name
        genUpdate["type"] = self.type
        return genUpdate

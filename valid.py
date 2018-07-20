import json

with open("charts.json") as file:
    structure = json.load(file)

def validCards():
    return structure["cards"].keys()

def validTests():
    return structure["tests"].keys()

def validSubtests(test):
    return structure["tests"][test].keys()

def validTypes(test,subtest):
    return structure["tests"][test][subtest].keys()

def validLabels(test, subtest, type):
    return structure["tests"][test][subtest][type].keys()

import auth
from pymongo import MongoClient
import pprint
import json
import pprint

"""
This file contains various variable which are required by the main python file
as well as the small calculations that are required to generate these variables
"""

# TODO: Connect to sheetsAPI and driveAPI

(sheetService, driveService) = auth.authorize()

pp = pprint.PrettyPrinter(indent=3)

chartStructure = "charts.json" # if a new test is added update this file

# define the location of the data base may need to be passed as cl arguments
username =  "admin"
password = "^6pVh_PYW$UhgkeL3pkwGCfKv3!DunGnKM+BRkYeB+6CzfM#8*U5*+twt2M_2z&&"
mongoURI = "localhost"
mongoPort = 27017
collectionName = "QE_Test_Data"
dbName = "QE_Database"

# The format of these dates is YYYY-MM
# Add 21 to year prefixes if this tool somehow lasts until 2100
yearPrefixes = r'19|20'
dateRegex = r'^(' + yearPrefixes + r'\d{2})-(1[0-2]|0[1-9])$'

# Sheet name format testInfo_YYYY_MM_DD_HH_MM_SS<end>
deconstruct_time = r'.*(\d{4})_(\d{2})_(\d{2})_(\d{2})_(\d{2})_(\d{2})$'

# get the json file in python ready format
with open(chartStructure) as file:
    structure = json.load(file)

tests = structure["tests"].keys()
print(tests)
cards = structure["cards"].keys()
print(cards)

# TODO: Connect to mongoDB
# Generic connection
client = MongoClient(mongoURI + ":" + str(mongoPort), username=username, password=password,
                      authSource="admin", authMechanism="SCRAM-SHA-1")
# client = MongoClient(mongoURI, mongoPort, username=username, password=password, authSource="admin")
db = client[dbName]
collection=db[collectionName] # Should each test have its own collection?
#If so this ^^^^ line needs to be inside a method

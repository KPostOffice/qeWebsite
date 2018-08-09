import sys
import config
from pymongo import MongoClient
import re
import auth
import helper
import argparse
# Takes two arguments which specify the range of months which you want to update
# over, the rest of the information will be pulled from charts.json

# Checks for valid number of inputs (1 or 2) duplicates first argument if
# no second argument is present
parser = argparse.ArgumentParser()

parser.add_argument('-s', '--start', required = True,
                    help='Start month for update of form YYYY-MM')

parser.add_argument('-e', '--end', required = False, default = None,
                    help='End month of form YYYY-MM, equal to --start by default')

args = parser.parse_args()

if(args.end == None):
    args.end = args.start

# NOTE: Validates dates and stores month and year
dateStart = re.match(config.dateRegex, args.start)
dateEnd = re.match(config.dateRegex, args.end)

if(not dateStart or not dateEnd):
    raise ValueError("Dates must be of the form YYYY-MM")

monthStart = int(dateStart.group(2))
print("Month start " + str(dateStart))
monthEnd = int(dateEnd.group(2))

yearStart = int(dateStart.group(1))
yearEnd = int(dateEnd.group(1))

### Keep sheetId to keep track of sheets in db already

helper.runUpdate(monthStart, yearStart, monthEnd, yearEnd)

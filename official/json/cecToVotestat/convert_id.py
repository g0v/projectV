#-*- encoding:utf-8 -*-
from os import listdir
from os.path import isfile, join
from sys import argv
import json

fout = open("%s.json"%'allvsid', 'w')
json_result = [] 

for mypath in ['TPE-4','TPQ-1','TPQ-6']:
  onlyfiles = [ f for f in listdir(mypath) if isfile(join(mypath,f)) ]
  #print onlyfiles
  #fout = open("%s.json"%mypath, 'w')
  #print onlyfiles
  for fname in onlyfiles:
    #print fname
    fin = open("%s/%s"%(mypath,fname))
    #print 'fin',fin
    json_objs = json.loads( "".join(fin.readlines()) )
    for json_obj in json_objs:
      json_temp_obj = {
        'id': json_obj['id'],
        'county': mypath
        } 
      json_result.append(json_temp_obj)

json_string = json.dumps(json_result, indent=4, sort_keys=True, separators=(',',':'), ensure_ascii=False) 
fout.write(json_string.encode('utf-8'))
fout.close() 


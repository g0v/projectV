#-*- encoding:utf-8 -*-
from os import listdir
from os.path import isfile, join
from sys import argv
import json
mypath = argv[1]
onlyfiles = [ f for f in listdir(mypath) if isfile(join(mypath,f)) ]
#print onlyfiles
fout = open("%s.json"%mypath, 'w')
json_result = {}
#print onlyfiles
for fname in onlyfiles:
  #print fname
  json_temp_array = []
  fin = open("%s/%s"%(mypath,fname))
  #print 'fin',fin
  json_objs = json.loads( "".join(fin.readlines()) )
  for json_obj in json_objs:
    json_temp_obj = {
      'id': json_obj['id'],
      'name': json_obj['place_name'],
      'address': json_obj['address'],
      'neighborhood':[json_obj['village'][:3]],
      'location':json_obj['location'],
      'power':json_obj['power'],
    }
    json_temp_array.append(json_temp_obj)
    #print json_temp_obj
    #print json.dumps(json_temp_obj, indent=4, separators=(',',':'), ensure_ascii=False) 
  fname2 = fname.decode('utf-8')
  json_result.update({'%s'%(fname2.replace('.json','')): json_temp_array})
  print ['%s'%(fname2.replace('.json',''))]
json_string = json.dumps(json_result, indent=4, sort_keys=True, separators=(',',':'), ensure_ascii=False) 
#json_string = json.dumps(json_result, ensure_ascii=False) 
print json_string
fout.write(json_string.encode('utf-8'))
fout.close() 


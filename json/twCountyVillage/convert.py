#-*- encoding:utf-8 -*-
import json
import pprint
import sys
f = open("%s-raw.json"%(sys.argv[1]))
lines = "".join(f.readlines())
f.close()
jsondata = json.loads(lines)
#pprint.pprint(jsondata)
votedata = jsondata[u"投票狀況"]
resultdata = {}
for townName in votedata:
    resultarray = [] 
    for villageName in votedata[townName]:
        #print '\t'+villageName
        resultarray.append(villageName)
    resultdata.update({townName:resultarray})
f2 = open("%s.json"%(sys.argv[1]),'w')
f2.write( json.dumps(resultdata, ensure_ascii=False).encode('utf8'))
f2.close()

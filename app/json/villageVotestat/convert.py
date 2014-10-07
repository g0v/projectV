import json
import pprint
import sys
countyVg = json.loads("".join(open('../twCountyVillage/%s.json'%(sys.argv[1])).readlines()))
voteStat = json.loads("".join(open('../votestat/%s.json'%(sys.argv[1])).readlines()))
result_dict = {}
for town in countyVg:
  result_dict_2 = {}
  for vill in countyVg[town]:
    result_ary = []
    for vs in voteStat[town]: 
      if vill in vs['neighborhood']:
        result_ary.append(vs['id'])
    result_dict_2.update({vill:result_ary})
  result_dict.update({town:result_dict_2})
#pprint.pprint(result_dict)
f2 = open("%s.json"%(sys.argv[1]),'w')
f2.write( json.dumps(result_dict, ensure_ascii=False).encode('utf8'))
f2.close()

files under this directory are downloaded-html from cec.gov.

what I did are

* Get 'http://db.cec.gov.tw/histQuery.jsp?voteCode=20120101T1A2&qryType=ctks&prvCode=07'

then we knows the links to each of area. for each areas I invoke the command

    $ wget -R swf,js,css,gif,html,png -l 2 -r -k -np 'http://db.cec.gov.tw/histQuery.jsp?voteCode=20120101T1A2&qryType=ctks&prvCode=01&cityCode=000&areaCode=04'

then I got about 30000+ files - this is archive.tar.gz.

and then remove unnecessary files, re-orgnize them and rename. we have files which are redy-to-parse under directory prvCode_07.

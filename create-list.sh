#!/bin/bash

find . | sed -e 's/^\.\///g' | grep -v node_modules > project.list.all
rm -f project.list

for f in `cat project.list.all`
do
	git ls-files --error-unmatch $f > /dev/null 2>&1
	if [ $? -eq 0 ] 
	then
		echo $f >> project.list
	fi 
done

rm -f project.list.all

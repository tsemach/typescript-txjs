#!/bin/bash

red=`tput setaf 1`
green=`tput setaf 2`
blue=`tput setaf 4`
reset=`tput sgr0`

failed=()
pass=()

for f in `cat ./tests.list`
do
	mocha $f
	isok=$?

	if [ $isok -ne 0 ]
	then	
		failed+=($f\n)
		
		continue;
	fi

	pass+=($f\n)
done

echo ${blue}pass: ${#pass[@]} tests${reset}
count=0
while [ $count -lt ${#pass[@]} ]
do
	echo ${pass[$count]}
	count=$(( $count + 1 ))
done

echo ""
echo ${red}failed: ${#failed[@]} tests${reset}
count=0
while [ $count -lt ${#failed[@]} ]
do
	echo ${failed[$count]}
	count=$(( $count + 1 ))
done
echo ""





#!/bin/bash

files=$(ls ./src/*.ts)

rm -f src/index.ts
for f in $files
do
	file=$(echo $f | sed -e 's/.\/src\///' | sed -e 's/.ts$//')
	if [ $file == 'index' ]
	then
		continue
	fi

	echo "export * from './$file';" >> src/index.ts
	echo "export * from './$file';"
done

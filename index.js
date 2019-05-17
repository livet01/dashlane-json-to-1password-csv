const fs = require('fs')
const stringify = require('csv-stringify')

const args = process.argv

if (args.length < 3) {
  console.error('Usage: convert <dashlane.json>')
  process.exit(3)
}

const dashlanePath = args[2]

fs.readFile(dashlanePath, processFile)

function processCsv(err, output) {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  fs.writeFile('./output.csv', output, finish)
}

function processFile(err, data) {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  const jsonData = JSON.parse(data)
  const topics = Object.keys(jsonData)
  const processedData = topics.reduce((acc, topic) => {
    const results = processTopic(topic, jsonData[topic])
    if (results.length > 0) {
      return acc.concat(results)
    }
    return acc
  }, [])
  stringify(processedData, processCsv)
}

function processTopic(name, data) {
  switch (name) {
    case 'AUTHENTIFIANT':
      // title,website,username,password,notes,custom field 1,custom field 2, custom field
      return data.map(d => {
        return [
          d.title,
          d.domain ? `https://${d.domain}` : '',
          d.login || d.email,
          d.password,
          d.note,
        ]
      })
    default:
      return []
  }
}

function finish(err) {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    console.log('Done')
    process.exit(0)
  }
}

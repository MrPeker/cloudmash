const fs = require('fs')
const glob = require('glob')
const path = require('path')
const _ = require('lodash')

// Process AWS icon set and save
// glob('./static/images/icons/aws/*/*/*_64.svg', {}, (err, files) => {
//   // console.log(err, files)
//   let services = []
//
//   files.map((file, i) => {
//     const originalFilePath = String(file)
//     const basename = path.basename(file)
//     const iconPath = 'images/icons/aws/svg/' + basename
//
//     fs.copyFileSync(originalFilePath, './static/' + iconPath)
//
//     let service = {
//       serviceName: basename.split('_')[1].replace(/-/g, ' '),
//       iconBasename: basename,
//       iconPath,
//       score: 100
//     }
//
//     console.log(service)
//     services.push(service)
//
//     if (i === files.length - 1) {
//       fs.writeFileSync('aws.json', JSON.stringify(services))
//     }
//   })
// })

// // Process Azure icon set and save
// glob('./static/images/icons/azure/*/*.svg', {}, (err, files) => {
//   // console.log(err, files)
//   let services = []
//
//   files.map((file, i) => {
//     const originalFilePath = String(file)
//     const basename = path.basename(file)
//     const serviceName = basename.replace(/\d+-icon-service-/, '').replace(/-/g, ' ').replace('.svg', '')
//     const iconPath = 'images/icons/azure/svg/' + basename
//
//     fs.copyFileSync(originalFilePath, './static/' + iconPath)
//
//     let service = {
//       serviceName,
//       iconBasename: basename,
//       iconPath,
//       score: 100
//     }
//
//     console.log(service)
//     services.push(service)
//
//     if (i === files.length - 1) {
//       fs.writeFileSync('azure.json', JSON.stringify(services))
//     }
//   })
// })

// Process Azure icon set and save
// glob('./static/images/icons/gcloud/*/*.svg', {}, (err, files) => {
//   // console.log(err, files)
//   let services = []
//
//   files.map((file, i) => {
//     const originalFilePath = String(file)
//     const basename = path.basename(file)
//     const serviceName = basename.replace(/-\d+-(color|flat).svg/, '').replace(/-/g, ' ').replace('.svg', '')
//     const iconPath = 'images/icons/gcloud/svg/' + basename
//
//     fs.copyFileSync(originalFilePath, './static/' + iconPath)
//
//     let service = {
//       serviceName: _.startCase(serviceName),
//       iconBasename: basename,
//       iconPath,
//       score: 100
//     }
//
//     console.log(service)
//     services.push(service)
//
//     if (i === files.length - 1) {
//       fs.writeFileSync('gcloud.json', JSON.stringify(services))
//     }
//   })
// })

// Create complete list of services
// let id = 0
// const awsServices = require('./aws').map(s => { id++; return {id, ...s, vendor: 'AWS', wins: 0, losses: 0} } )
// const azureServices = require('./azure').map(s => { id++; return {id, ...s, vendor: 'Azure', wins: 0, losses: 0} } )
// const gcloudServices = require('./gcloud').map(s => { id++; return {id, ...s, vendor: 'Google Cloud', wins: 0, losses: 0} } )
//
// const services = [...awsServices, ...azureServices, ...gcloudServices]
//
// setTimeout(() => {
//   fs.writeFileSync('./services.json', JSON.stringify(services))
// }, 1000)
//
//
//


const services = require('./services')

const data = services.map(service => {
  return {
    key: `service:${service.id}`,
    "value": service,
    "created": "2021-07-26T15:52:42.000Z",
    "modified": "2021-07-26T15:52:42.000Z",
    "label1": service.vendor,
    "label2": service.score,
    "label3": service.wins,
    "label4": service.losses
  }
})

fs.writeFileSync('data-2.json', JSON.stringify(data))
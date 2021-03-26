#!/usr/bin/python3

import os
import time
import sys
from html.parser import HTMLParser
import base64
import simplejson
import math

if sys.getdefaultencoding() != 'utf-8':
    reload(sys)
    sys.setdefaultencoding('utf-8')

systemjsKey = '{#systemjs}'
pollyfillKey = '{#pollyfill}'
settingMatchKey = '{#settings}'
mainMatchKey = '{#importMap}'
engineMatchKey = '{#cocosengine}'
projectMatchKey = '{#project}'
resMapMatchKey = '{#resMap}'
ttfMapMatchKey = '{#ttfMap}'
indexMatchKey = '{#index}'
applicationMatchKey = '{#application}'
resourcesMatchKey = '{#resources}'

fileByteList = ['.png', '.jpg', '.mp3', '.ttf', '.plist', 'txt', '.bin']

base64PrefixList = {
    '.png': 'data:image/png;base64,',
    '.jpg': 'data:image/jpeg;base64,',
    '.mp3': '',
    '.ttf': '',
    '.plist': 'data:text/plist;base64,',
    '.bin': ''
}


def read_in_chunks(filePath):
    extName = os.path.splitext(filePath)[1]
    print(extName)
    if extName in fileByteList:
        print("base64")
        file_object = open(filePath, 'rb')
        base64Str = base64.b64encode(file_object.read())
        base64Prefix = base64PrefixList[extName]
        if base64Prefix != None:
            base64Str = bytes(base64Prefix, 'utf-8') + base64Str
            return base64Str
    elif extName == '':
        return None

    file_object = open(filePath, encoding='utf-8')
    return file_object.read()


def writeToPath(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(data)


def getResMap(jsonObj, path, resPath):
    fileList = os.listdir(path)
    for fileName in fileList:
        absPath = path + '/' + fileName
        if (os.path.isdir(absPath)):
            getResMap(jsonObj, absPath, resPath)
        elif (os.path.isfile(absPath) and absPath.find("main/index.js") == -1):
            print("path{}".format(absPath))
            dataStr = read_in_chunks(absPath)
            if dataStr != None:
                absPath = absPath.replace(resPath + '/', '')
                jsonObj[absPath] = dataStr


def getResMapScript(resPath):
    jsonObj = {}
    getResMap(jsonObj, resPath, resPath)
    jsonStr = simplejson.dumps(jsonObj)
    resStr = str("window.resMap = ") + jsonStr
    return resStr

# This issue is fixed in Cocos Creator 2.x


def fixEngineError(engineStr):
    newEngineStr = engineStr.replace(
        "t.content instanceof Image", "t.content.tagName === \"IMG\"", 1)
    return newEngineStr


def addPlistSupport(mainStr):
    newMainStr = mainStr.replace(
        "json: jsonBufferHandler,", "json: jsonBufferHandler, plist: jsonBufferHandler,", 1)
    return newMainStr


def integrate(projectRootPath):
    htmlPath = projectRootPath + '/build/web-mobile/index.html'
    newHtmlPath = './index.html'
    systemjsSrcPath = projectRootPath + '/build/web-mobile/src/system.bundle.js'
    plolyFillSrcPath = projectRootPath + '/build/web-mobile/src/polyfills.bundle.js'
    settingScrPath = projectRootPath + '/build/web-mobile/src/settings.json'
    mainScrPath = projectRootPath + '/build/web-mobile/src/import-map.json'
    engineScrPath = projectRootPath + '/build/web-mobile/cocos-js/cc.js'
    projectScrPath = projectRootPath + '/build/web-mobile/assets/main/index.js'
    resoucesSrcPath = projectRootPath + '/build/web-mobile/assets/resources/index.js'
    applicationSrcPath = projectRootPath + '/build/web-mobile/application.js'
    resPath = projectRootPath + '/build/web-mobile/assets'
    indexInternalScrPath = projectRootPath + \
        '/build/web-mobile/index.js'

    htmlStr = read_in_chunks(htmlPath)
    settingsStr = read_in_chunks(settingScrPath)
    htmlStr = htmlStr.replace(settingMatchKey, settingsStr, 1)

    systemjsStr = read_in_chunks(systemjsSrcPath)
    htmlStr = htmlStr.replace(systemjsKey, systemjsStr, 1)

    pollyfillStr = read_in_chunks(plolyFillSrcPath)
    htmlStr = htmlStr.replace(pollyfillKey, pollyfillStr, 1)

    projectStr = read_in_chunks(projectScrPath)
    htmlStr = htmlStr.replace(projectMatchKey, projectStr, 1)

    resourcesStr = read_in_chunks(resoucesSrcPath)
    htmlStr = htmlStr.replace(resourcesMatchKey, resourcesStr, 1)

    mainStr = read_in_chunks(mainScrPath)
    htmlStr = htmlStr.replace(mainMatchKey, mainStr, 1)

    applicationStr = read_in_chunks(applicationSrcPath)
    htmlStr = htmlStr.replace(applicationMatchKey, applicationStr, 1)

    indexStr = read_in_chunks(indexInternalScrPath)
    htmlStr = htmlStr.replace(indexMatchKey, indexStr, 1)

    engineStr = read_in_chunks(engineScrPath)
    engineStr = fixEngineError(engineStr)
    htmlStr = htmlStr.replace(engineMatchKey, engineStr, 1)

    resStr = getResMapScript(resPath)
    htmlStr = htmlStr.replace(resMapMatchKey, resStr, 1)

    writeToPath(newHtmlPath, htmlStr)

    targetFileSize = os.path.getsize(newHtmlPath)
    targetFileSizeInMegabyte = math.ceil(
        targetFileSize * 1000 / (1024 * 1024)) / 1000

    print("===================  All Done! =================== ")
    print("Target file = {}, with size {}M".format(
        newHtmlPath, targetFileSizeInMegabyte))


if __name__ == '__main__':
    workDir = os.getcwd() + "/.."
    integrate(workDir)

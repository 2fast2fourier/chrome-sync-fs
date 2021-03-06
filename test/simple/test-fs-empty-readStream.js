// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var common = require('../common')
var assert = require('assert')
var path = require('path')
var fs = require('../../chrome')

var emptyFile = path.join(common.fixturesDir, 'empty.txt')

fs.writeFile(emptyFile, '', function (e) {
  if (e) {
    console.log(e)
    throw e
  }
  fs.open(emptyFile, 'r', function (error, fd) {
    assert.ifError(error)

    var read = fs.createReadStream(emptyFile, { 'fd': fd })
    console.log(read)
    read.once('data', function () {
      throw new Error('data event should not emit')
    })

    var readEmit = false
    read.once('end', function () {
      readEmit = true
      console.error('end event 1')
    })

    setTimeout(assert.equal, 100, readEmit, true)
  })

  fs.open(emptyFile, 'r', function (error, fd) {
    assert.ifError(error)

    var read = fs.createReadStream(emptyFile, { 'fd': fd })
    read.pause()

    read.once('data', function () {
      throw new Error('data event should not emit')
    })

    var readEmit = false
    read.once('end', function () {
      readEmit = true
      console.error('end event 2')
    })
    read.close(function () {
      fs.unlink(emptyFile, function (err) {
        if (err) {
          assert.fail(err)
        }
        console.log('test-fs-empty-readStream-1 success')
      })
    })
    setTimeout(assert.equal, 100, readEmit, false)
  })
})

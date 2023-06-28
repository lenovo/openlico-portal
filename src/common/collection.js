/*
 * Copyright 2015-2023 Lenovo
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function sortObjectsByProp(objects, prop, order, compareFunc) {
  function compareProperty(objA, objB) {
    let valA = objA[prop]
    let valB = objB[prop]
    if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
      valA = Number(valA)
      valB = Number(valB)
    }
    // Default is ASC
    if (valA > valB) {
      return 1
    } else if (valA < valB) {
      return -1
    } else {
      return 0
    }
  }
  if (compareFunc) {
    objects.sort(compareFunc)
  } else {
    objects.sort(compareProperty)
  }
  if (order.indexOf('desc') >= 0) {
    objects.reverse()
  }
}

// Type: in, range
function filterObjectsByProp(objects, prop, type, values) {
  const filterObjects = []
  objects.forEach(obj => {
    if (type === 'in') {
      if (values.indexOf(obj[prop]) >= 0) {
        filterObjects.push(obj)
      }
    }
    if (type === 'range') {
      if (obj[prop] >= values[0] && obj[prop] <= values[1]) {
        filterObjects.push(obj)
      }
    }
  })
  return filterObjects
}

function searchObjectsByProps(objects, props, keyword, caseSensitive = false) {
  const searchObjects = []
  objects.forEach(obj => {
    let match = false
    props.forEach(prop => {
      if (caseSensitive && obj[prop] && obj[prop].toString().indexOf(keyword) >= 0) {
        match = true
        // Need to skip from loop
      }
      if (!caseSensitive && obj[prop] && lowerCase(obj[prop]).indexOf(lowerCase(keyword)) >= 0) {
        match = true
        // Need to skip from loop
      }
    })
    if (match) {
      searchObjects.push(obj)
    }
  })
  function lowerCase(val) {
    return val.toString().toLowerCase()
  }
  return searchObjects
}

function removeByValue(arr, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === val) {
      arr.splice(i, 1)
      break
    }
  }
}

export default {
  sortObjectsByProp,
  filterObjectsByProp,
  searchObjectsByProps,
  removeByValue,
}

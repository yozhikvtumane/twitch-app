//Get list of users followed by a selected user helix/users/follows?from_id=USERNAME_ID:
// add a name and id to the object userFollows
// map through recieved Ids and get login names
//get streams

// let url = 'https://api.twitch.tv/helix/users/follows?from_id=79427747'

let userId = '79427747' //Me
let userLogin = 'powdinet' //Me
const followersUrl = 'https://api.twitch.tv/helix/users/follows?first=100&from_id=' //concat with userUrl
const userUrl = 'https://api.twitch.tv/helix/users?id='
const userLoginUrl = 'https://api.twitch.tv/helix/users?login='
const streamUrl = 'https://api.twitch.tv/helix/streams?user_id='

const loader = document.querySelector('.loader')
const followsDiv = document.getElementById('follows')

const userFollows = {
    follows: []
}

const myHeader = {
    'Client-ID':'6fteiigokjanbxzyotyhkp1mu5zzbl' //please don't steal
}

function onlineChannelElement(onlineChannel) {
    let listItem = document.createElement('li')
    let channelAvatar = document.createElement('img')
    let streamLink = document.createElement('a') //twitch.tv + login
    let streamTitle = document.createElement('h4')
    let streamOnline = document.createElement('h4')

    channelAvatar.src = onlineChannel.thumb
    streamTitle.textContent = onlineChannel.title
    streamLink.href = onlineChannel.link
    streamLink.textContent = onlineChannel.channelName
    streamOnline.textContent = 'Online'
    streamOnline.classList.add('online-green')

    listItem.append(channelAvatar, streamLink, streamTitle, streamOnline)
    return listItem
    
}

function offlineChannelElement(offlineChannel) {
    let listItem = document.createElement('li')
    let streamLink = document.createElement('a') //twitch.tv + login
    let streamOffline = document.createElement('h4')
    
    streamLink.href = 'https://twitch.tv/' + offlineChannel.login
    streamLink.textContent = offlineChannel.channelName
    streamOffline.textContent = 'Offline'
    streamOffline.classList.add('offline-red')

    listItem.append(streamLink, streamOffline)
    return listItem
}

function getData(url) {
    return fetch(url, {
        headers: myHeader
    }).then(response => {
        return response.json()
    }).catch(err => console.log(err))
}

function getFollowers(url) {
    loader.classList.add('loader-active')
    getData(url).then(
        data => {
            console.log('data from getFollowers')
            console.log(data)
            data.data.map(e => {
                userFollows.follows.push({
                    id: e.to_id,
                    channelName: e.to_name
                })
            })
        }
    ).then(()=> getLoginNames(userFollows))
}

function getLoginNames(userList) {
    const userIdsUrl = userList.follows.map(e=>e.id)
    const url = userUrl + userIdsUrl.join('&id=')
    
    getData(url).then(data=>{

        data.data.map(e=>{

            userList.follows.map(z=>{
                if (e.id === z.id) {
                    z.login = e.login
                }
            })
        })

    }).then(() => getStreams(userFollows))
}


function getStreams(userList) {
    const userIdsUrl = userList.follows.map(e=>e.id)
    const url = streamUrl + userIdsUrl.join('&user_id=')

    getData(url).then(data => {

        data.data.map(e => {
            userList.follows.map(z=>{
                if (e.user_id === z.id) {
                    let thumb = e.thumbnail_url.replace('{width}x{height}' , '200x200')
                    z.live = true
                    z.title = e.title
                    z.thumb = thumb
                    z.link = 'https://twitch.tv/' + z.login
                }
            })
        })
    }).then(()=>{

        let elements = {
            online: [],
            offline: []
        }
        userFollows.follows.map(e=>{
            e.live ? elements.online.push(onlineChannelElement(e)) : elements.offline.push(offlineChannelElement(e))
        })

        elements.online.map(e=>followsDiv.append(e))
        elements.offline.map(e=>followsDiv.append(e))
        loader.classList.remove('loader-active')
    })
}

// getFollowers(followersUrl + userId) // Init
getFollowers(followersUrl + '36093806') // TESTING FOLLOWER WITH MORE THAN 100 subscriptions



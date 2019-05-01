const followersUrl = 'https://api.twitch.tv/helix/users/follows?first=100&from_id=' //concat with userUrl
const userUrl = 'https://api.twitch.tv/helix/users?id='
const userLoginUrl = 'https://api.twitch.tv/helix/users?login='
const streamUrl = 'https://api.twitch.tv/helix/streams?user_id='

const loader = document.querySelector('.loader')
const followsDiv = document.getElementById('follows')
const username = document.getElementById('username')
const submitButton = document.getElementById('submit')
const currentUser = document.getElementById('currentUser')

const userFollows = {
    follows: [],
    currentUser: '',
}

const myHeader = {
    'Client-ID':'6fteiigokjanbxzyotyhkp1mu5zzbl' //please don't steal
}

function onlineChannelElement(onlineChannel) {
    let listItem = document.createElement('li')
    let channelAvatar = document.createElement('img')
    let streamLink = document.createElement('a')
    let streamTitle = document.createElement('h4')
    let streamOnline = document.createElement('h4')

    channelAvatar.src = onlineChannel.thumb
    streamTitle.textContent = onlineChannel.title
    streamLink.href = onlineChannel.link
    streamLink.target = '_blank'
    streamLink.textContent = onlineChannel.channelName
    streamOnline.textContent = 'Online'
    streamOnline.classList.add('online-green')

    listItem.append(channelAvatar, streamLink, streamTitle, streamOnline)
    return listItem
    
}

function offlineChannelElement(offlineChannel) {
    let listItem = document.createElement('li')
    let streamLink = document.createElement('a')
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


function getUserId(userLogin) {
    while (followsDiv.firstElementChild.firstChild) {
        followsDiv.firstElementChild.removeChild(followsDiv.firstElementChild.firstChild)
    }
    
    loader.classList.add('loader-active')
    currentUser.textContent = userLogin

    getData(userLoginUrl + userLogin).then(
        data => {
            userFollows.currentUser = data.data[0].id
            userFollows.follows = []
            
        }
    ).then(() => getFollows(followersUrl + userFollows.currentUser))
}

function getFollows(url) {
    getData(url).then(
        data => {
            data.data.map(e => {
                userFollows.follows.push({
                    id: e.to_id,
                    channelName: e.to_name
                })
            })
        }
    ).then(() => getLoginNames(userFollows)).catch(err => console.log(err))
}

function getLoginNames(userList) {
    const userIdsUrl = userList.follows.map(e=>e.id)
    const url = userUrl + userIdsUrl.join('&id=')
    
    getData(url).then(data => {
        data.data.map(e => {
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
                    let thumb = e.thumbnail_url.replace('{width}x{height}' , '80x80')
                    z.live = true
                    z.title = e.title
                    z.thumb = thumb
                    z.link = 'https://twitch.tv/' + z.login
                }
            })
        })
    }).then(() => {
        let elements = {
            online: [],
            offline: []
        }

        userFollows.follows.map(e => {
            e.live ? elements.online.push(onlineChannelElement(e)) : elements.offline.push(offlineChannelElement(e))
        })

        elements.online.map(e => followsDiv.firstElementChild.append(e))
        elements.offline.map(e => followsDiv.firstElementChild.append(e))
        loader.classList.remove('loader-active')
    })
}

getUserId('chlenososik') //Init

submitButton.addEventListener('click', (e) => {
    e.preventDefault()
    if (username.value !== '') {
        userFollows.currentUserLogin = username.value
        getUserId(username.value)
    } else {
        return
    }
})
const getTokenFromQuery = () => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('token')
}

const saveTokenToLocalStorage = (token) => {
    localStorage.setItem('token', token)
}

const getTokenFromLocalStorage = () => {
    return localStorage.getItem('token')
}

const greetUser = (token) => {
    const payload = JSON.parse(atob(token.split('.')[1]))
    document.getElementById('username').innerText = payload.username
    document.getElementById('profilePicture').src = `https://cdn.discordapp.com/avatars/${payload.id}/${payload.avatar}.png`
}

const postSpeakData = async (token, speakData) => {
    const response = await fetch('https://learn.corporate.ef.com/api/displayAssignments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: speakData })
    })

    const result = await response.json()
    window.result = result
    displayAssignments(result)
}

const displayAssignments = (data) => {
    const assignmentsDiv = document.getElementById('assignments')
    assignmentsDiv.innerHTML = ''

    const mainTitle = document.createElement('div')
    mainTitle.className = 'assignment-title'
    mainTitle.innerText = data.title
    assignmentsDiv.appendChild(mainTitle)

    data.children.forEach(child => {
        const lessonBox = document.createElement('div')
        lessonBox.className = 'lesson-box'
        lessonBox.setAttribute('data-id', child.id)

        const lessonSequence = document.createElement('div')
        lessonSequence.className = 'lesson-sequence'
        lessonSequence.innerText = child.sequenceNumber
        lessonBox.appendChild(lessonSequence)

        const lessonTitle = document.createElement('div')
        lessonTitle.className = 'lesson-title'
        lessonTitle.innerText = child.title
        lessonBox.appendChild(lessonTitle)

        const dropdown = document.createElement('div')
        dropdown.className = 'dropdown'

        const revealAnswersButton = document.createElement('button')
        revealAnswersButton.innerText = 'Revelar Resposta'
        revealAnswersButton.addEventListener('click', async () => {
            revealAnswersButton.disabled = true
            const notificationProgress = document.createElement('div')
            notificationProgress.className = 'notification yellow'
            notificationProgress.innerText = 'em andamento...'
            lessonBox.appendChild(notificationProgress)

            const lessonId = lessonBox.getAttribute('data-id')
            const courseId = window.result.ids.courses[0]
            const token = window.result.token.account

            const payload = {
                nodeId: lessonId,
                token: token,
                courseId: courseId
            }

            const response = await fetch("https://learn.corporate.ef.com/api/fetch-data", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const fetchDataResponse = await response.json()

            const displayDataPayload = {
                gapfillAnswers: fetchDataResponse.gapfillAnswers,
                categorisationResults: fetchDataResponse.categorisationResults,
                selectedResponses: fetchDataResponse.selectedResponses,
                sequencingResults: fetchDataResponse.sequencingResults,
                rawResponse: fetchDataResponse.rawResponse,
                token: token
            }

            const displayDataResponse = await fetch("https://learn.corporate.ef.com/api/display-data", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(displayDataPayload),
            })

            notificationProgress.style.display = 'none'

            if (!displayDataResponse.ok) {
                const notification = document.createElement('div')
                notification.className = 'notification red'
                notification.innerText = 'Falha ao buscar dados de exibição'
                lessonBox.appendChild(notification)
                throw new Error('Failed to fetch display data')
            }

            const htmlContent = await displayDataResponse.text()
            const htmlContentDiv = document.getElementById('htmlContent')
            htmlContentDiv.innerHTML = htmlContent
            htmlContentDiv.style.display = 'block'

            revealAnswersButton.disabled = false
        })
        dropdown.appendChild(revealAnswersButton)

        const autoAnswerButton = document.createElement('button')
        autoAnswerButton.innerText = 'Auto Resposta'
        autoAnswerButton.addEventListener('click', async () => {
            autoAnswerButton.disabled = true
            const notificationProgress = document.createElement('div')
            notificationProgress.className = 'notification yellow'
            notificationProgress.innerText = 'em andamento...'
            lessonBox.appendChild(notificationProgress)

            const lessonId = lessonBox.getAttribute('data-id')
            const courseId = window.result.ids.courses[0]
            const token = window.result.token.account

            const payload = {
                nodeId: lessonId,
                token: token,
                courseId: courseId
            }

            const response = await fetch("https://learn.corporate.ef.com/api/fetch-data", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
            const fetchDataResponse = await response.json()
            const autoAnswerPayload = {
                response: fetchDataResponse.rawResponse,
                token: token
            }

            const autoAnswerResponse = await fetch("https://learn.corporate.ef.com/api/auto-answer", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(autoAnswerPayload),
            })

            notificationProgress.style.display = 'none'

            if (autoAnswerResponse.ok) {
                const notification = document.createElement('div')
                notification.className = 'notification'
                notification.innerText = 'concluído com sucesso!'
                lessonBox.appendChild(notification)
            } else {
                const notification = document.createElement('div')
                notification.className = 'notification red'
                notification.innerText = 'Falha na resposta automática'
                lessonBox.appendChild(notification)
            }
        })
        dropdown.appendChild(autoAnswerButton)

        lessonBox.appendChild(dropdown)
        assignmentsDiv.appendChild(lessonBox)
    })
}

const token = getTokenFromQuery()
if (token) {
    saveTokenToLocalStorage(token)
}

const storedToken = getTokenFromLocalStorage()
if (!storedToken) {
    window.location.href = 'index.html'
} else {
    greetUser(storedToken)
}

const speakData = getSpeakDataFromLocalStorage()
if (speakData) {
    removeSpeakDataFromLocalStorage()
    postSpeakData(storedToken, speakData)
}

document.getElementById('logoutButton').addEventListener('click', function() {
    localStorage.removeItem('token')
    window.location.href = 'index.html'
})

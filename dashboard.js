const getTokenFromQuery = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
}

const saveTokenToLocalStorage = (token) => {
    localStorage.setItem('token', token);
}

const getTokenFromLocalStorage = () => {
    return localStorage.getItem('token');
}

const greetUser = (token) => {
    const payload = JSON.parse(atob(token.split('.')[1]));
    document.getElementById('username').innerText = payload.username;
    document.getElementById('profilePicture').src = `https://cdn.discordapp.com/avatars/${payload.id}/${payload.avatar}.png`;
}

const postSpeakData = async (token, speakData) => {
    const response = await fetch('https://learn.corporate.ef.com/api/displayAssignments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: speakData })
    });

    const result = await response.json();
    displayAssignments(result);
}

const displayAssignments = (data) => {
    const assignmentsDiv = document.getElementById('assignments');
    assignmentsDiv.innerHTML = '';

    const mainTitle = document.createElement('div');
    mainTitle.className = 'assignment-title';
    mainTitle.innerText = data.title;
    assignmentsDiv.appendChild(mainTitle);

    data.assignments.forEach((assignment) => {
        const assignmentDiv = document.createElement('div');
        assignmentDiv.className = 'assignment-item';
        assignmentDiv.innerText = assignment.title;
        assignmentsDiv.appendChild(assignmentDiv);
    });
}

const token = getTokenFromQuery() || getTokenFromLocalStorage();
if (token) {
    saveTokenToLocalStorage(token);
    greetUser(token);
    postSpeakData(token, { speakData: 'example_data' });
}


const CHANNEL_ID = "mQ9DveNb0MEfN5LC";
const roomName = "algebra";
const form = document.getElementById("registrationForm");
const sendForm = document.getElementById("sendForm");
const messageUl = document.getElementById("messages");
let drone;

form.addEventListener("submit", submitForm);
sendForm.addEventListener("submit", sendMessage);

const randomColor = () => {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16);
};

function submitForm(e) {
  e.preventDefault();
  const formData = new FormData(form);
  const user = Object.fromEntries(formData);

  drone = new window.Scaledrone(CHANNEL_ID, {
    data: {
      id: user.id,
      username: user.username,
      room: roomName,
      color: randomColor(),
    },
  });

  drone.on("open", (error) => {
    if (error) {
      return console.error(error);
    }

    user.scaledroneId = drone.clientId;
    console.log("Successfully connected to Scaledrone");
  });

  drone.on("error", (error) => console.error(error));

  const room = drone.subscribe(`observable-${roomName}`);

  room.on("open", (error) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Connected to room " + roomName);
      sendForm.style.display = "block";
      form.style.display = "none";
      form[0].value = "";
    }
  });

  room.on("message", (message) => {
    const { data, member } = message;
    const liElement = document.createElement("li");
    if (member.id === user.scaledroneId) liElement.className = "active";
    liElement.innerHTML = `<p>${data}</p><sub>${member.clientData.username}</sub>`;
    messageUl.appendChild(liElement);
  });
}

function sendMessage(e) {
  e.preventDefault();
  const formData = new FormData(sendForm);
  const { message } = Object.fromEntries(formData);
  if (drone) {
    drone.publish({
      room: `observable-${roomName}`,
      message: message,
    });

    sendForm[0].value = "";
  }
}

"use strict";

// connection
const socket = io.connect('http://localhost:1024');

// characters
const chatters = Rx.Observable.of([
  {
    id: "",
    name: "norryowl",
    nameDisplay: "Norryowl",
    avatar: "fallout-geralt.jpg"
  },
  {
    id: "valorad",
    name: "valorad",
    nameDisplay: "Valorad",
    avatar: "fallout_vaultboy_va.jpg"
  },
  {
    id: "",
    name: "wcxaaa",
    nameDisplay: "wcxaaa",
    avatar: "fallout_vaultboy_wc.jpg"
  },
  {
    id: "",
    name: "cookieCat",
    nameDisplay: "饼干猫",
    avatar: "kitty-1.jpg"
  },
  {
    id: "",
    name: "toastKitto",
    nameDisplay: "ToastKitto",
    avatar: "kitty-20.jpg"
  },
  {
    id: "",
    name: "longyiszh",
    nameDisplay: "Crucsoul Dragonborn",
    avatar: "MtG-IlustracionesEpic.jpg"
  },
  {
    id: "",
    name: "xiaobaizxj",
    nameDisplay: "小白直膝箭",
    avatar: "Tes-Drag.jpg"
  }
]);

const getChatterInfo = (chatterName) => {
  return new Promise((resolve, reject) => {
    chatters
    .map((Info)=>{
      return Info.filter((singleInfo) => { return singleInfo.name === chatterName})
    })
    // .filter((info) => {
    //   console.log(info);
    //   return info.name === chatterName;
    // })
    .subscribe(
      (info) => {
        resolve(info);
      },
      (err) => {
        reject(null);
      }
    );
  });
};

const assignChatter = async (name) => {
  let newChatterInfo = await getChatterInfo(name);
  
  let target = document.querySelector("button#switchUser > img");
  if (target) {
    target.src = "images/" + newChatterInfo[0].avatar;
    target.alt = newChatterInfo[0].nameDisplay;
    target.title = newChatterInfo[0].name;
  }

  return newChatterInfo;

};

const toggle = (selector) => {
  let ele = document.querySelector(selector);
  if (ele) {
    ele.style.display = (ele.style.display === 'none'? 'block' : 'none');
  }
  return ele;
};

// place chatter selections

const placeChatterSelections = (chatters) => {
  let target = document.querySelector("section.chatterMenu > ul");
  if (target) {
    for (let chatter of chatters) {
      let newLi = document.createElement("li");
      let newChatter = `

        <div class="menuItem">
          <div class="menuAvatar">
            <img src="images/${chatter.avatar}" alt="${chatter.nameDisplay}" title="${chatter.name}">
          </div>
          <div class="menuName">
            <p>${chatter.nameDisplay}</p>
          </div>
        </div>

      `;
      newLi.innerHTML = newChatter;
      newLi.addEventListener('click', async () => {
        await assignChatter(chatter.name);
        toggle("section.chatterMenu");
      });
      target.appendChild(newLi);
    }
  }
};

let chatterTyping = [];

// const chatterTypingObs = Rx.Observable.of(chatterTyping)
//   .subscribe((val) => {
//     console.log(val);
//   });

const chatterTypingSub = new Rx.Subject();

const addTypingChatter = (name) => {
  if (
    // the chatter has not typed
    chatterTyping.some((existChatter)=>{
      return existChatter === name;
    })
  ) {
    // already in, do nothing

  } else {
    chatterTyping.push(name);
  }

};

const deleteTypingChatter = (chatterName) => {
  let cIndex = chatterTyping.indexOf(chatterName);
  if (cIndex >= 0) {
    chatterTyping.splice(cIndex, 1);
  }
};

const getTypingChatter = () => {
  return new Promise((resolve, reject) => {
    chatterTypingSub.subscribe(
      (val) => {
        resolve(val);
      },
      (err) => {
        reject(err);
      },
      () => {
        chatterTypingSub.unsubscribe();
      }
    );
    chatterTypingSub.next(chatterTyping);
  });
};

// DOM events
const suButton = document.querySelector("button#switchUser");
suButton.addEventListener('click', () => {
  toggle("section.chatterMenu");
});

//  -- init --


const init = async () => {
  // get character selection menu data
  chatters.subscribe(
    (resChatters) => {

      placeChatterSelections(resChatters);

    }
  )

  let defaultChatter = await assignChatter("norryowl");

  // grab dom element for comm to rear-end
  
  const chatterBox = document.querySelector("button#switchUser > img");
  const dialogBox = document.querySelector("main.app");

  const sendButton = document.querySelector("button#send");
  sendButton.addEventListener('click', ()=> {
    socket.emit('chat', {
      message: messageBox.value,
      chatter: chatterBox.title
    });
    messageBox.value = "";
  });

  const messageBox = document.querySelector("textarea#msg");

  const messageEnter = Rx.Observable.fromEvent(messageBox, 'keyup')
    .throttleTime(1000)
    //.map(event => event.target.value)
    .subscribe(() => {
      socket.emit('typing', chatterBox.title);
    });

  const messageOver = Rx.Observable.fromEvent(messageBox, 'keyup')
  .debounceTime(1000)
  //.map(event => event.target.value)
  .subscribe(() => {
    socket.emit('typeOver', chatterBox.title);
  });

  socket.on('chat', async (data) => {
    let chatter = await getChatterInfo(data.chatter);
    let newDialog = document.createElement("div");
    newDialog.className = "dialogHolder";

    newDialog.innerHTML = `
    
      <div class="avatarHolder">
        <div class="dialogAvatar">
          <img src="images/${chatter[0].avatar}" alt="${chatter[0].nameDisplay}" title="${chatter[0].name}">
        </div>
      </div>

      <div class="messageHolder">
        <p>${chatter[0].nameDisplay}</p>
        <div class="message">
          ${data.message}
        </div>
      </div>

    `;

    dialogBox.appendChild(newDialog);

  });


  socket.on('typing', async (chatterName) => {
    // push chatterTyping
    let allTypingChatters = await getTypingChatter(chatterName);
    //console.log(allTypingChatters);
    
    if (!allTypingChatters.includes(chatterName)) {
      // not included in the current chatters, then gather info and show typing dialog
      let chatter = await getChatterInfo(chatterName);

      let newTyping = document.createElement("div");
      
      newTyping.className = `dialogHolder typing-${chatter[0].name}`;
      
      newTyping.innerHTML = `
          
        <div class="avatarHolder">
          <div class="dialogAvatar">
            <img src="images/${chatter[0].avatar}" alt="${chatter[0].nameDisplay}" title="${chatter[0].name}">
          </div>
        </div>
  
        <div class="messageHolder">
          <p>${chatter[0].nameDisplay}</p>
          <div class="message">
            <em>${chatter[0].nameDisplay} is typing...</em>
          </div>
        </div>
  
      `;
      
      dialogBox.appendChild(newTyping);

      // add to the array
      addTypingChatter(chatterName);
    }


  });

  socket.on('typeOver', (chatterName) => {
    // delete chatter name from the array
    deleteTypingChatter(chatterName);

    // remove from the dom

    let oldTypingFeed = document.querySelector(`.typing-${chatterName}`);
    if (oldTypingFeed) {
      oldTypingFeed.closest(".app").removeChild(oldTypingFeed);
    }

  });

  //const feedbackBox = document.querySelector("section.feedback");

};

init();



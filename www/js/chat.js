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
  console.log("hhhhhh");
  let newChatterInfo = await getChatterInfo(name);
  
  let target = document.querySelector("button#switchUser > img");
  if (target) {
    target.src = "images/" + newChatterInfo[0].avatar;
    target.alt = newChatterInfo[0].nameDisplay;
    target.title = newChatterInfo[0].name;
  }

  console.log(newChatterInfo);

  return newChatterInfo;

};

const toggle = (selector) => {
  let ele = document.querySelector(selector);
  if (ele) {
    ele.style.display = (ele.style.display === 'none'? 'block' : 'none');
  }
  return ele;
};

// DOM events
const suButton = document.querySelector("button#switchUser");
suButton.addEventListener('click', () => {
  toggle("section.chatterMenu");
});

// init

// place chatter selections

//let localChatters = [];
const placeChatterSelections = (chatters) => {
  let target = document.querySelector("section.chatterMenu > ul");
  if (target) {
    for (let chatter of chatters) {
      let newLi = document.createElement("li");
      let newChatter = `

        <div class="menuItem">
          <div class="menuAvatar">
            <img src="images/${chatter.avatar}" alt="${chatter.name}">
          </div>
          <div class="menuName">
            <p>${chatter.nameDisplay}</p>
          </div>
        </div>

      `;
      newLi.innerHTML = newChatter;
      target.appendChild(newLi);
    }
  }
};

chatters.subscribe(
  (resChatters) => {
    // localChatters = resChatters;
    placeChatterSelections(resChatters);
    //console.log(resChatters);
  }
)

assignChatter("norryowl");

// routes/index.js
const fetch = require('node-fetch');
const express = require('express');
const upbitController = require('../controllers/upbitController');
const router = express.Router();

const libKakaoWork = require('../libs/kakaoWork');
const { getNowPrice } = require('../controllers/upbitController');

router.get('/', async (req, res, next) => {
    const users = await libKakaoWork.getUserList();

    const conversations = await Promise.all(
        users.map((user) => 
        libKakaoWork.openConversations({ userId:
        user.id }))
    );

    const messages = await Promise.all([
      conversations.map((conversation) =>
        libKakaoWork.sendMessage({
          conversationId: conversation.id,
          text: "코인 시세 확인",
          blocks: [
            {
              type: "header",
              text: "코인 시세 확인",
              style: "blue"
            },
            {
              type: "button",
              action_type : "call_modal",
              value: "coin_value_check",
              text: "확인하기",
              style: "default"
            },
          ],
        })
      ),
    ]);

    res.json({
      users,
      conversations,
      messages,
    })
});

router.post('/request', async (req, res, next) => {
    const { message, value } = req.body;

    switch (value) {
        case 'coin_value_check':
            return res.json( {
                view: {
                    title: "비트코인 시세 확인",
                    accept: "현제 시세 확인",
                    decline: "취소",
                    value: "coin_value_check",
                    blocks: [
                      {
                        type: "label",
                        text: "확인할 코인",
                        markdown: true
                      },
                      {
                        type: "input",
                        name: "coinName",
                        required: false,
                        placeholder: "코인 이름을 입력해주세요"
                      }
                    ],
                  },
            });
            break;
        default:
    }

    res.json({});
})

router.post('/callback', async (req, res, next) => {
    const { message, actions, action_time, value} = req.body;

    const name = actions.coinName.replace(" ", ""); // API에서 사용하는 코인이름들은 모두 공백이 없기 때문에 공백 제거
    const coinInfo = await getNowPrice(name); // 코인이름으로 해당코인에 대한 정보 json 가져옴
    let change;

    // 등락률 문자열
    // 상승 => 빨간 글씨
    // 하락 => 파란 글씨
    if (coinInfo[0]['change'] == 'RISE') {
      change = "<span style=color: 'red';>" + coinInfo[0]['change_rate'] * 100 + "% </span>"
    }
    else {
      change = "<span style=color: 'blue';>" + coinInfo[0]['change_rate'] * 100 + "% </span>"
    }

    switch (value) {
        case 'coin_value_check':
            await libKakaoWork.sendMessage({
                conversationId: message.conversation_Id,
                blocks: [
                    {
                      type: "header",
                      text: actions.coinName,
                      style: "blue"
                    },
                    {
                      type: "text",
                      text: coinInfo[0]['trade_price'] + " KRW",
                      markdown: true
                    },
                    {
                      type: "text",
                      text: change,
                      markdown: true
                    },
                    {
                      type: "context",
                      content: {
                        type: "text",
                        text: "[업비트 바로가기](https://upbit.com/home)",
                        markdown: true
                      },
                      image: {
                        type: "image_link",
                        url: "https://media-exp1.licdn.com/dms/image/C510BAQFVzDy2sKZ52Q/company-logo_200_200/0/1554266285425?e=2159024400&v=beta&t=fNz18xWZsfjpyS3sv7xGv-GlZULwA_qv89bvS6mMNxs"
                      }
                    }
                  ]
            });
            break;
        default:
    }

    res.json({ result: true });
});


module.exports = router;
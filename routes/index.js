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

    let coinValue = getNowPrice(actions.coinName);
    coinValue.replace(" ", "");

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
                      text: coinValue,
                      markdown: true
                    },
                    {
                      type: "text",
                      text: "등락",
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
// routes/index.js
const fetch = require('node-fetch');
const express = require('express');
const upbitController = require('../controllers/upbitController');
const router = express.Router();

const libKakaoWork = require('../libs/kakaoWork');
const { getNowPrice } = require('../controllers/upbitController');
  
coinName_all = ['비트코인골드', '스택스', '엠블', '이더리움클래식', '이오스', '비트코인캐시에이비씨', '리퍼리움', '톤', '애드엑스', '썬더토큰', '질리카', '폴카닷', '스테이터스네트워크토큰', '앵커', '엑시인피니티', '에스티피', '웨이브', '스트라이크', '쎄타토큰', '저스트', '메탈', '쎄타퓨엘', '트웰브쉽스', '그로스톨코인', '메인프레임', '온톨로지', '페이코인', '헤데라해시그래프', '스와이프', '알파쿼크', '아이오에스티', '이그니스', '룸네트워크', '칠리즈', '던프로토콜', '아이콘', '아하토큰', '펀디엑스', '리플', '마로', '엔진코인', '픽셀', '스트라티스', '스팀', '카바', '왁스', '베이직어텐션토큰', '코스모스', '에이다', '스토리지', '온톨로지가스', '가스', '메타디움', '모스코인', '비트코인에스브이', '제로엑스', '시아코인', '코모도', '캐리프로토콜', '도지코인', '오브스', '스텔라루멘', '아인스타이늄', '플로우', '비트코인캐시', '리스크', '트론', '쿼크체인', '퀴즈톡', '옵저버', '피르마체인', '파워렛저', '엘비알와이크레딧', '아크', '골렘', '휴먼스케이프', '스팀달러', '넴', '샌드박스', '오미세고', '하이브', '크립토닷컴체인', '퀀텀', '헌트', '람다', '아이오타', '엔도르', '세럼', '시빅', '메디블록', '아더', '아르고', '스톰엑스', '어거', '이더리움', '디센트럴랜드', '센티넬프로토콜', '폴리매쓰', '디카르고', '엘프', '플레이댑', '썸씽', '무비블록', '카이버네트워크', '체인링크', '비트토렌트', '디마켓', '라이트코인', '보라', '에브리피디아', '솔브케어', '테조스', '밀크', '네오', '비체인', '코박토큰', '비트코인'];

router.get('/', async (req, res, next) => {
    const users = await libKakaoWork.getUserList();
	
    const conversations = await Promise.all(
        users
		// .filter((user) => [""].indexOf(user.name) !== -1)
		.map((user) => 
        libKakaoWork.openConversations({
				userId: user.id
		}))
    );

    const messages = await Promise.all([
      conversations.map((conversation) =>
        libKakaoWork.sendMessage({
          conversationId: conversation.id,
          text: "머스크 형 다음은 어디야?",
          blocks: [
            {
              type: "header",
              text: "머스크 형 다음은 어디야?",
              style: "blue"
            },

			{
			  type: "image_link",
			  url: "https://img.hankyung.com/photo/202104/01.26042041.1.jpg"
			},
			{
			  type: "text",
			  text: "안녕? 난 *일론 머스크*야\n나의 말 한마디에 코인시장이 흔들리지.\n다음 코인이 궁금하면 눌러보라고!",
			  markdown: true
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
    });
});

router.post('/request', async (req, res, next) => {
    const { message, value } = req.body;
	console.log("request");
	console.log(value);

	// 검색할 코인 예시를 보여주는 코드, coinName_all로부터 random_index를 통해 추천해준다.
	random_index = parseInt(Math.random() * coinName_all.length);
    console.log(random_index);

	switch (value) {
        case 'coin_value_check':
            return res.json( {
                view: {
                    title: "비트코인 시세 확인",
                    accept: "현재 시세 확인",
                    decline: "취소",
                    value: "coin_value_check",
                    blocks: [
					  {
						type: "label",
						text: `오늘의 추천 코인은
*${coinName_all[random_index]}* 입니다
검색해보시는건 어떨까요?

제가 현재가와 등락률을 알려드릴게요!
`,
						markdown: true
					  },
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
	
	const comma = (x) => {
   		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	
	
    // 등락률 문자열
	// text block의 글자색상 변경이 불가능하므로
	// 헤더색으로 판단해야함.
	header_color = '';
	sign = ''
	msg = ''
    if (coinInfo[0]['change'] == 'RISE') {
		change += '+';
      	header_color = 'red';
		sign += '+';
		msg = '오... 떡상각?!'
    }
    else {
		change += '-';
      	header_color = 'blue';
		sign += '-';
		msg = '지금이 추가매수 찬스?!'
    }
	msg += '\n\n* *모든 매수 매도 판단은 본인 몫입니다.*'
	change = (coinInfo[0]['change_rate'] * 100).toFixed(3) + "%";
	
    switch (value) {
        case 'coin_value_check':
            await libKakaoWork.sendMessage({
                conversationId: message.conversation_id,
				text:`${name}의 시세`,
                blocks: [
                    {
                      type: "header",
                      text: actions.coinName,
                      style: header_color
                    },
					
					{
						type: "description",
						term: "현재가",
						content: {
							type: "text",
							text: `${comma(coinInfo[0]['trade_price'])} KRW`,
							markdown: true
						},
						accent: true
					},
					{
						type: "description",
						term: "등락률",
						content: {
							type: "text",
							text: sign+change,
							markdown: true
						},
						accent: true
					},
					{
						type: "text",
						text: msg,
						markdown: true
					},
					/*
                    {
                      type: "text",
                      text: `현재 ${comma(coinInfo[0]['trade_price'])} KRW (${change})`,
					  markdown: true
                    },
                    {
                      type: "text",
                      text: change,
                      markdown: true
                    },
					*/
					{
					  type: "divider"
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
const fetch = require('node-fetch');

function name2Market (name) {
    const url = 'https://api.upbit.com/v1/market/all';
    const options = {method: 'GET', qs: {isDetails: 'false'}};
    const market = fetch(url, options)
    .then(res => res.json())
    .then(json => {
        for (i in json) {
            if (json[i]["korean_name"] === name || json[i]['english_name'] === name) {
            return json[i]["market"];
            }
        }
    })
    .catch(err => console.error('error:' + err));
    if (!market) console.log("error occurred");
    else return market;
}
module.exports = {
    getNowPrice: async(req, res) => {
        try {
            const name = req.name;
            const market = await name2Market(name);
            const url = 'https://api.upbit.com/v1/ticker?markets=' + market;
            const options = {method: 'GET'};
            const now_price = fetch(url, options)
            .then(res => res.json())
            .then(json => {
                console.log(json);
                return json[0]['trade_price']
            });
            return now_price;
        } catch (err) {
            return err;
        }
    }
};
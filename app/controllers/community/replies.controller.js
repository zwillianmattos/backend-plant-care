const { Replies } = require('../../models');
const Sequelize = require('sequelize');

module.exports = {
    async store(req, res) {
        try {
            const { body } = req.body;
            const user = req.user;
            const { thread } = req.params;

            const replie = await Replies.create({
                user: user.id,
                thread: thread,
                body: body
            })

            res.status(200).json({
                replie
            })
        } catch (e) {
            console.log(e)
            res.status(500).json({
                status: false,
                message: e
            })
        }

    },
    show(req, res) {

    },
}
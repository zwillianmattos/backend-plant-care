
const { Channel, Thread, User, Replies } = require('../../../database/models');
const Sequelize = require('sequelize');
const { empty } = require('../../utils/utils');

module.exports = {
    async show(req, res) {
        try {
            const { channel, thread } = req.params;

            const where = {
                id: {
                    [Sequelize.Op.in]: [thread]
                },
                channel: {
                    [Sequelize.Op.in]: [channel]
                },
                excluded: 0
            }

            let include = [
                { model: User, as: 'User', attributes: ['id', 'name'], required: true, },
                { model: Channel, as: 'Channel', attributes: ['name', 'slug'], required: true, },

            ]

            if (channel != null) {
            include.push({
                model: Replies,
                as: 'Replies',
                attributes: ['id', 'body', 'createdAt', 'updatedAt'],
                required: false,
                where: {
                    excluded: 0
                },
                include: {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'name'],
                    required: true,
                },
            })
            }


            const channels = await Thread.findAll({
                attributes: ['id', 'title', 'body', 'createdAt', 'updatedAt'],
                where: channel != null ? where : {
                    excluded: 0
                },
                include: include,
            })

            res.status(200).json(channels)
        } catch (e) {
            console.error(e)
            res.status(500).json({
                status: false,
                message: e
            })
        }
    },
    async store(req, res) {
        try {
            const { body, title, channel_id } = req.body;
            const user = req.user;

            const thread = await Thread.create({
                user: user.id,
                channel: channel_id,
                title: title,
                body: body
            })

            res.status(200).json({
                thread
            })
        } catch (e) {
            console.log(e)
            res.status(500).json({
                status: false,
                message: e
            })
        }

    },
    async delete(req, res) {
        try {
            const { channel, thread } = req.params
            const user = req.user

            let threadFind = await Thread.findOne({
                attributes: ['id', 'title', 'body', 'createdAt', 'updatedAt'],
                where: {
                    channel: channel,
                    id: thread,
                    user: user.id
                }
            })

            if (empty(threadFind)) {
                throw ("Ocorreu um erro ao remover thread!");
            }

            Thread.update({
                excluded: 1,
            }, {
                where: {
                    channel: channel,
                    id: thread,
                    user: user.id
                }
            }).then(async (t) => {
                await Replies.update({
                    excluded: 1,
                }, {
                    where: {
                        thread: thread
                    }
                })
            })

            res.status(200).json({
                status: true,
                message: "Thread excluida com sucesso!!!"
            })

        } catch (e) {
            console.log(e)
            res.status(500).json({
                status: false,
                message: e
            })
        }
    }
}
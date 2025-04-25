module.exports = async (req, res) => {
    res.json({ token: process.env.AUTH_TOKEN });
};

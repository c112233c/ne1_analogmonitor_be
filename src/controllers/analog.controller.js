const service = require("../services/analog.service");

async function getStations(req, res, next) {
    try {
        res.json(await service.getStations());
    } catch (e) {
        next(e);
    }
}

async function getBays(req, res, next) {
    try {
        res.json(await service.getBays(req.params.sub));
    } catch (e) {
        next(e);
    }
}

async function getPoints(req, res, next) {
    try {
        res.json(await service.getPoints(req.params.sub, req.params.bay));
    } catch (e) {
        next(e);
    }
}

async function getHistory(req, res, next) {
    try {
        const { gid, from, to } = req.query;

        if (!gid || !from || !to) {
            return res.status(400).json({
                message: "gid, from and to are required"
            });
        }

        const start = new Date(from);
        const end = new Date(to);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
            return res.status(400).json({ message: "Invalid date range" });
        }

        if (end - start > 31 * 24 * 60 * 60 * 1000) {
            return res.status(400).json({ message: "Date range must not exceed 31 days" });
        }

        const rows = await service.getHistory(gid, from, to);

        if (!rows.length) {
            return res.json({ point: null, data: [] });
        }

        const first = rows[0];

        res.json({
            point: {
                gid: first.gid,
                sub: first.sub,
                bay: first.bay,
                type: first.type,
                unit: first.unit
            },
            data: rows.map((row) => ({
                date_time: row.date_time,
                min: row.min,
                max: row.max,
                avg: row.avg
            }))
        });
    } catch (e) {
        next(e);
    }
}

async function getDetail(req, res, next) {
    try {
        const { type, from, to } = req.query;

        if (!type || !from || !to) {
            return res.status(400).json({
                message: "type, from and to are required"
            });
        }

        const start = new Date(from);
        const end = new Date(to);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
            return res.status(400).json({ message: "Invalid date range" });
        }

        if (end - start > 31 * 24 * 60 * 60 * 1000) {
            return res.status(400).json({ message: "Date range must not exceed 31 days" });
        }

        const rows = await service.getDetail(type, from, to);

        res.json({
            type,
            from,
            to,
            data: rows
        });
    } catch (e) {
        next(e);
    }
}

module.exports = {
    getStations,
    getBays,
    getPoints,
    getHistory,
    getDetail
};

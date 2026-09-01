const db = require("../config/database");

async function getStations() {
    const [rows] = await db.query(`
        SELECT DISTINCT sub
        FROM gid_detail
        WHERE used = 'Y' AND sub IS NOT NULL
        ORDER BY sub
    `);
    return rows;
}

async function getBays(sub) {
    const [rows] = await db.query(`
        SELECT DISTINCT bay
        FROM gid_detail
        WHERE sub = ? AND used = 'Y' AND bay IS NOT NULL
        ORDER BY bay
    `, [sub]);
    return rows;
}

async function getPoints(sub, bay) {
    const [rows] = await db.query(`
        SELECT gid, type, unit
        FROM gid_detail
        WHERE sub = ? AND bay = ? AND used = 'Y'
        ORDER BY FIELD(type, 'P','Q','IA','IB','IC','PF'), type
    `, [sub, bay]);
    return rows;
}

async function getHistory(gid, from, to) {
    const [rows] = await db.query(`
        SELECT d.gid, d.sub, d.bay, d.type, d.unit,
               c.date_time, c.min, c.max, c.avg
        FROM gid_detail d
        JOIN calculate_data c ON c.gid = d.gid
        WHERE d.gid = ?
          AND c.date_time >= ?
          AND c.date_time < ?
        ORDER BY c.date_time
    `, [gid, from, to]);
    return rows;
}

async function getDetail(type, from, to, sub = "") {
    const params = [type, from, to];
    let whereSub = "";

    if (sub) {
        whereSub = "          AND d.sub = ?\n";
        params.push(sub);
    }

    const [rows] = await db.query(`
        SELECT d.sub, d.bay, d.type, d.unit,
               c.date_time, c.min, c.max, c.avg
        FROM gid_detail d
        JOIN calculate_data c ON c.gid = d.gid
        WHERE d.type = ?
          AND d.used = 'Y'
          AND d.sub IS NOT NULL
          AND d.bay IS NOT NULL
          AND c.date_time >= ?
          AND c.date_time < ?
${whereSub}        ORDER BY c.date_time, d.sub, d.bay
    `, params);
    return rows;
}

module.exports = {
    getStations,
    getBays,
    getPoints,
    getHistory,
    getDetail
};

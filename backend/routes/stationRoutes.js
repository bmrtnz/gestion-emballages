// backend/routes/stationRoutes.js
const express = require("express");
const router = express.Router();
const {
    createStation,
    getStations,
    updateStation,
    deleteStation,
} = require("../controllers/stationController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const {
    createStationValidator,
    updateStationValidator,
} = require("../validators/stationValidators");

/**
 * @fileoverview Routes pour la gestion des stations.
 * @module routes/stationRoutes
 */

/**
 * @swagger
 * tags:
 *   name: Stations
 *   description: Gestion des stations
 */

const managerOnly = [protect, authorize("Manager", "Gestionnaire")];

router
    .route("/")
    /**
     * @swagger
     * /stations:
     *   get:
     *     summary: Récupérer la liste des stations actives
     *     tags: [Stations]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Une liste de stations.
     */
    .get(protect, getStations)
    /**
     * @swagger
     * /stations:
     *   post:
     *     summary: Créer une nouvelle station
     *     tags: [Stations]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Station'
     *     responses:
     *       201:
     *         description: Station créée avec succès.
     */
    .post(...managerOnly, createStationValidator, validate, createStation);

router
    .route("/:id")
    /**
     * @swagger
     * /stations/{id}:
     *   put:
     *     summary: Mettre à jour une station
     *     tags: [Stations]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de la station
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Station'
     *     responses:
     *       200:
     *         description: Station mise à jour avec succès.
     */
    .put(...managerOnly, updateStationValidator, validate, updateStation)
    /**
     * @swagger
     * /stations/{id}:
     *   delete:
     *     summary: Désactiver une station (soft delete)
     *     tags: [Stations]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de la station
     *     responses:
     *       200:
     *         description: Station désactivée avec succès.
     */
    .delete(...managerOnly, deleteStation);

module.exports = router;

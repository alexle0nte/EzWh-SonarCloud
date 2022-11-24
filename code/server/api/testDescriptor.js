"use strict";

module.exports = function (app, ezwh, body, validationResult, param) {
	/********************************************************************
	 *              TEST DESCRIPTOR
	 *******************************************************************/
	/**
* GET /api/testDescriptors
* @returns an array containing all test descriptors.
*/
	app.get("/api/testDescriptors", (req, res) => {
//		if (
//				req.cookies.user !== "manager" &&
//				req.cookies.user !== "quality employee") 
//				return res.status(401).end();

		console.log("retrieving all test descriptors");
		ezwh.getTestDescriptors()
			.then(testDescriptors => res.status(200).json(testDescriptors.map(td => td.toJson())))
			.catch((err) => res.status(500).end());
	});

	/**
	 * GET /api/testDescriptors/:id
	 * @returns a test descriptor, given its id.
	 */
	app.get("/api/testDescriptors/:id", param("id").isInt({ min: 0 }), (req, res) => {
//		if (req.cookies.user !== "manager") 
//			return res.status(401).end();

		const errors = validationResult(req);
		if (!errors.isEmpty())
			return res.status(422).json({ errors: errors.array() });

		console.log("retrieving test descriptor: " + req.params.id);
		ezwh.getTestDescriptorByID(req.params.id)
			.then((testDescriptor) =>
				testDescriptor
					? res.status(200).json(testDescriptor.toJson())
					: res.status(404).end()
			)
			.catch((err) => res.status(500).end());
	});

	/**
	 * POST /api/testDescriptor
	 * Creates a new test descriptor.
	 */
	app.post(
		"/api/testDescriptor",
		body("name").isString(),
		body("procedureDescription").isString(),
		body("idSKU").isInt({ min: 0 }),
		(req, res) => {
//			if (req.cookies.user !== "manager") 
//				return res.status(401).end();

			const errors = validationResult(req);
			if (!errors.isEmpty())
				return res.status(422).json({ errors: errors.array() });

			console.log("creating new test descriptor");
			ezwh.createTestDescriptor(
				req.body.name,
				req.body.procedureDescription,
				req.body.idSKU
			)
				.then(() => res.status(201).send())
				.catch((err) => err === "404" ? res.status(404).end() : res.status(503).end())
		});

	/**
		 * PUT /api/testDescriptor/:id
		 * Modify a testDescriptor, given its id.
		 */
	app.put(
		"/api/testDescriptor/:id",
		body("newName").isString(),
		body("newProcedureDescription").isString(),
		body("newIdSKU").isInt({ min: 0 }),
		param("id").isInt({ min: 0 }),
		(req, res) => {
//			if (req.cookies.user !== "manager") 
//				return res.status(401).end();

			const errors = validationResult(req);
			if (!errors.isEmpty())
				return res.status(422).json({ errors: errors.array() });

			console.log("modifying test descriptor : " + req.params.id);
			ezwh.modifyTestDescriptor(
				req.params.id,
				req.body.newName,
				req.body.newProcedureDescription,
				req.body.newIdSKU
			)
				.then((data) => res.status(200).end())
				.catch((err) =>
					err === "404" ? res.status(404).end() : res.status(503).end()
				);

		});

	/**
	 * DELETE /api/testDescriptor/:id
	 * Delete a test descriptor, given its id.
	 */
	app.delete("/api/testDescriptor/:id", param("id").isInt({ min: 0 }), (req, res) => {
//		if (req.cookies.user !== "manager") return res.status(401).end();

		const errors = validationResult(req);
		if (!errors.isEmpty())
			return res.status(422).json({ errors: errors.array() });

		console.log("deleting test descriptor :" + req.params.id);
		ezwh.deleteTestDescriptor(req.params.id)
			.then((data) => res.status(204).end())
			.catch((err) => res.status(503).end());
	});

};

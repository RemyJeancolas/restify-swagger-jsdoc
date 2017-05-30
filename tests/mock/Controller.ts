export class Controller {
    /**
     * @swagger
     * /foo/{id}:
     *   get:
     *     description: Get foo by id
     *     tags:
     *       - Foo
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         description: Foo id
     *         in: path
     *         required: true
     *         type: integer
     *     responses:
     *       400:
     *         description: Invalid foo id
     *       404:
     *         description: Foo not found
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/definitions/Foo'
     */
    public route(): string {
        return 'Bar';
    }
}

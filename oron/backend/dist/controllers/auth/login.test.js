"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const supertest_1 = require("supertest");
const typeorm_1 = require("typeorm");
const dbCreateConnection_1 = require("orm/dbCreateConnection");
const User_1 = require("orm/entities/User");
const __1 = require("../..");
describe('Login', () => {
    let dbConnection;
    let userRepository;
    const userPassword = 'pass1';
    const user = new User_1.User();
    user.email = 'brandon.mayhew@test.com';
    user.password = userPassword;
    user.hashPassword();
    user.role = 'ADMINISTRATOR';
    before(async () => {
        dbConnection = await (0, dbCreateConnection_1.dbCreateConnection)();
        userRepository = (0, typeorm_1.getRepository)(User_1.User);
    });
    beforeEach(async () => {
        await userRepository.save(user);
    });
    afterEach(async () => {
        await userRepository.delete(user.id);
    });
    it('should return a JWT token', async () => {
        const res = await (0, supertest_1.agent)(__1.app).post('/v1/auth/login').send({ email: user.email, password: userPassword });
        (0, chai_1.expect)(res.status).to.equal(200);
        (0, chai_1.expect)(res.body.message).to.equal('Token successfully created.');
        (0, chai_1.expect)(res.body.data).not.to.be.empty;
        (0, chai_1.expect)(res.body.data).to.be.an('string');
    });
    it("should report error when email and password don't match", async () => {
        const res = await (0, supertest_1.agent)(__1.app).post('/v1/auth/login').send({ email: user.email, password: 'wrong_password' });
        (0, chai_1.expect)(res.status).to.equal(404);
        (0, chai_1.expect)(res.body.errorType).to.equal('General');
        (0, chai_1.expect)(res.body.errors).to.eql(['Incorrect email or password']);
        (0, chai_1.expect)(res.body.errorRaw).to.an('null');
        (0, chai_1.expect)(res.body.errorsValidation).to.an('null');
    });
    it('should report error when the email provided is not valid', async () => {
        const res = await (0, supertest_1.agent)(__1.app).post('/v1/auth/login').send({ email: 'not_valid_email', password: userPassword });
        (0, chai_1.expect)(res.status).to.equal(400);
        (0, chai_1.expect)(res.body.errorType).to.equal('Validation');
        (0, chai_1.expect)(res.body.errorMessage).to.equal('Login validation error');
        (0, chai_1.expect)(res.body.errors).to.an('null');
        (0, chai_1.expect)(res.body.errorRaw).to.an('null');
        (0, chai_1.expect)(res.body.errorsValidation).to.eql([
            {
                email: 'Email is invalid',
            },
        ]);
    });
});
//# sourceMappingURL=login.test.js.map
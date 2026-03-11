"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const supertest_1 = require("supertest");
const typeorm_1 = require("typeorm");
const dbCreateConnection_1 = require("orm/dbCreateConnection");
const User_1 = require("orm/entities/User");
const __1 = require("../..");
describe('Register', () => {
    let dbConnection;
    let userRepository;
    const userPassword = 'pass1';
    const user = new User_1.User();
    user.email = 'brandon.mayhew@test.com';
    user.password = userPassword;
    user.hashPassword();
    before(async () => {
        dbConnection = await (0, dbCreateConnection_1.dbCreateConnection)();
        userRepository = (0, typeorm_1.getRepository)(User_1.User);
    });
    it('should register a new user', async () => {
        const res = await (0, supertest_1.agent)(__1.app)
            .post('/v1/auth/register')
            .send({ email: user.email, password: userPassword, passwordConfirm: userPassword });
        (0, chai_1.expect)(res.status).to.equal(200);
        (0, chai_1.expect)(res.body.message).to.equal('User successfully created.');
        (0, chai_1.expect)(res.body.data).to.be.an('null');
        await userRepository.delete({ email: user.email });
    });
    it('should report error when email already exists', async () => {
        let res = await (0, supertest_1.agent)(__1.app)
            .post('/v1/auth/register')
            .send({ email: user.email, password: userPassword, passwordConfirm: userPassword });
        res = await (0, supertest_1.agent)(__1.app)
            .post('/v1/auth/register')
            .send({ email: user.email, password: userPassword, passwordConfirm: userPassword });
        (0, chai_1.expect)(res.status).to.equal(400);
        (0, chai_1.expect)(res.body.errorType).to.equal('General');
        (0, chai_1.expect)(res.body.errorMessage).to.equal('User already exists');
        (0, chai_1.expect)(res.body.errors).to.eql([`Email '${user.email}' already exists`]);
        (0, chai_1.expect)(res.body.errorRaw).to.an('null');
        (0, chai_1.expect)(res.body.errorsValidation).to.an('null');
        await userRepository.delete({ email: user.email });
    });
});
//# sourceMappingURL=register.test.js.map
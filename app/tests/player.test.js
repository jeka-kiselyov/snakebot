const expect = require('chai').expect;
const assert = require('chai').assert;

const ArrayHelper = require('../classes/ArrayHelper.js');
const UIHelper = require('../classes/UIHelper.js');
const GameSurround = require('../classes/GameSurround.js');
const GameClient = require('../classes/GameClient.js');
const GameBoardConstants = require('../classes/GameBoardConstants.js');

const Player1 = require('../classes/Player1.js');

const path = require('path');


describe('Player1', function() {
	it('does not go closer to wall if there is another same route', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/same_distance_do_not_go_to_wall.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);

		//// player should try to avoid contact with wall if pathes to target are the same.
		expect(player.bestMove).to.equal('RIGHTWARD'); /// in related-to-player-head coordinates
		expect(player.command).to.equal('DOWN');       /// in game field coordinates
	});

	it('do_not_move_to_wall_on_the_very_begining.dat', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/do_not_move_to_wall_on_the_very_begining.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);

		console.log(player.command);
		expect(player.bestMove).to.not.include('LEFTWARD'); /// in related-to-player-head coordinates
	});

	it('do_not_go_to_wall_at_any_case.dat', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/do_not_go_to_wall_at_any_case.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);

		expect(player.bestMove).to.equal('RIGHTWARD');       /// in game field coordinates
	});


	it('do not drop rocks if there is another rock closer than player tail', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/long_and_rock_is_closer_than_player_tail.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);

		//// there should be no ACT command 
		expect(player.command).to.not.include('ACT');
	});

	it('--------- drop rocks if there is no another rock closer than player tail', async function() {
		//// @todo: check for distance to enemies
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/long_and_no_rock_closer_than_player_tail.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);

		//// there is ACT command 
		//        expect(player.command).to.include('ACT');
	});

	it('when_have_to_go_back_change_direction.dat', async function() {
		//// @todo: check for distance to enemies
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/when_have_to_go_back_change_direction.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);

		//// there is ACT command 
		///
		expect(player.command).to.be.a('string'); 
		expect(["LEFTWARD", "RIGHTWARD"]).to.include(player.bestMove);
	});

	it('go_forward_on_initial.dat', async function() {
		//// @todo: check for distance to enemies
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/go_forward_on_initial.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);

		console.log(player.command);
		//// there is ACT command 
		///
		// expect(player.command).to.be.a('string'); 
		expect(["LEFTWARD", "RIGHTWARD"]).to.not.include(player.bestMove);
	});

	it('why.dat', async function() {
		//// @todo: check for distance to enemies
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/why.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);

		console.log(player.command);
		//// there is ACT command 
		///
		// expect(player.command).to.be.a('string'); 
		expect(["LEFTWARD"]).to.not.include(player.bestMove);
	});

	it('do_not_go_to_target_if_enemy_goes_to_it.dat', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/do_not_go_to_target_if_enemy_goes_to_it.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);

		console.log(player.command);
		expect(player.bestMove).to.not.include('LEFTWARD'); /// in related-to-player-head coordinates
	});


	it('do_not_go_to_target_if_enemy_is_longer_and_goes_to_it.dat', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/do_not_go_to_target_if_enemy_is_longer_and_goes_to_it.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);

		console.log(player.command);
		expect(player.bestMove).to.not.include('LEFTWARD'); /// in related-to-player-head coordinates
	});

	it('do_not_go_to_target_if_enemy_is_longer_and_goes_to_it_on_the_next_move.dat', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/do_not_go_to_target_if_enemy_is_longer_and_goes_to_it_on_the_next_move.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);

		console.log(player.command);
		expect(player.bestMove).to.not.include('LEFTWARD'); /// in related-to-player-head coordinates
	});

	it('go_trying_to_kill_the_enemy_if_player_is_longer.dat', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/go_trying_to_kill_the_enemy_if_player_is_longer.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);

		console.log(player.command);
		expect(player.bestMove).to.include('LEFTWARD'); /// in related-to-player-head coordinates
	});

	it('go_trying_to_kill_the_enemy_if_player_is_longer2.dat', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/go_trying_to_kill_the_enemy_if_player_is_longer2.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);
		
		console.log(player.command);
		expect(player.bestMove).to.include('LEFTWARD'); /// in related-to-player-head coordinates
	});

	it('do_not_go_trying_to_kill_if_enemy_is_fury.dat', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/do_not_go_trying_to_kill_if_enemy_is_fury.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);

		console.log(player.command);
		expect(player.bestMove).to.not.include('LEFTWARD'); /// in related-to-player-head coordinates
	});

	it('do_not_go_trying_to_kill_if_enemy_is_fury2.dat', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/do_not_go_trying_to_kill_if_enemy_is_fury2.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);

		console.log(player.command);
		expect(player.bestMove).to.not.include('LEFTWARD'); /// in related-to-player-head coordinates
	});


	it('go_to_kill_if_enemy_head_is_close.dat', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/go_to_kill_if_enemy_head_is_close.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);

		console.log(player.command);
		expect(player.bestMove).to.include('LEFTWARD'); /// in related-to-player-head coordinates
	});


	it('do_not_go_to_kill_if_enemy_is_close_but_longer.dat', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/do_not_go_to_kill_if_enemy_is_close_but_longer.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);

		console.log(player.command);
		expect(player.bestMove).to.not.include('LEFTWARD'); /// in related-to-player-head coordinates
	});


	it('longer_that_3.dat', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/longer_that_3.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);
		console.log(player.command);
		expect(player.bestMove).to.not.include('LEFTWARD'); /// in related-to-player-head coordinates
	});

	it('do_not_go_to_possible_position_of_longer_enemy.dat', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/do_not_go_to_possible_position_of_longer_enemy.dat'));

		let player = new Player1();
		player.lookAtBoard(gc.board);
		console.log(player.bestMove);

		expect(player.bestMove).to.not.include('FORWARD'); /// in related-to-player-head coordinates
	});

	it('strange_case.dat', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/strange_case.dat'));

		let player = new Player1('nr_mvout_');
		player.lookAtBoard(gc.board);
		console.log(player.bestMove);
		expect(player.bestMove).to.not.include('FORWARD'); /// in related-to-player-head coordinates

		player = new Player1();
		player.lookAtBoard(gc.board);
		console.log(player.bestMove);
		expect(player.bestMove).to.not.include('FORWARD'); /// in related-to-player-head coordinates
	});

	it('strange_case2.dat', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'playerlevels/strange_case2.dat'));

		let player = new Player1('nr_mvout_');
		player.lookAtBoard(gc.board);
		console.log(player.bestMove); 

		// @todo

		expect(player.bestMove).to.not.include('FORWARD'); /// in related-to-player-head coordinates
		
	});
// 
});
const { spawn } = require("child_process");
const { stdout } = require("process");

const COMMANDS = [
	["karma", "karma start karma.config.js --no-single-run --no-browsers"],
	["webpack", "webpack serve --config webpack.config.js"],
	["proxy", "node proxy.js"]
];

for (let [name, command] of COMMANDS) {
	console.log(`[${name}] Command: ${command}`);
	let proc = spawn("bash", ["-c", command], {"cwd": "./_develop"});

	proc.stdout.on('data', (data) => {
		stdout.write(`[${name}] ${data}`);
	});

	proc.stderr.on('data', (data) => {
		stdout.write(`[${name}] ${data}`);
	});
}


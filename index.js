module.exports = {
	whatTimeIsIt() {
		return new Date().toLocaleTimeString();
	},

	whatIsTheDate() {
		return new Date().toLocaleDateString();
	}
};

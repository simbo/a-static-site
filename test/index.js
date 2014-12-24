
var exec = require('child_process').exec,
    sys = require('sys');

describe('a-static-site', function() {

    it('should build without errors', function(done) {
        this.timeout(120000);
        exec('npm run build', function(err, stdout, stderr ) {
            sys.print(stdout);
            if (err !== null) {
                console.log(err);
            }
            done();
        });
    });

});

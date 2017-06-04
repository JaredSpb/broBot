#!/usr/bin/perl
use strict;
use feature qw|say|;
my @files;
$/ = undef;

die("Provide valid project dir name.") unless($ARGV[0]);

foreach(sort(glob($ARGV[0].'/*.js')))
{
	say $_;
	open IN, $_;
	my $data = <IN>;
	if(/header/)
	{
		$data =~ s/version(\s+)(.*)$/"version ".$2.'.'.time()/gme;
	}
	push(@files,$data);
}

open OUT, '>',$ARGV[0].'.user.js';
print OUT join("\n",@files);

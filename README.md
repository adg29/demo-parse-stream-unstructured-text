Run `node index.js ${fileToRead}`
This will write a JSON file with output. The file will be named results-people-data-${fileToRead}.json

People Name Program 1.0
=======================

Description
-----------

Write a program that processes the included example file that contains
people's names, outputs some statistics and generates updated output.

Input:

 . An arbitrary file with the same format as the attached example file. Your
   program will be tested on much (e.g., 100x) larger files.


Output:

  1. The unique count of full, last, and first names (i.e., duplicates are
     counted only once)
  2. The ten most common last names (the names and number of occurrences
     sorted in descending order)
  3. The ten most common first names (the names and number of occurrences
     sorted in descending order)
  4. A list of modified names (see below for details)


Assumptions About Names
-----------------------

Here are some assumptions you can make about names which are meant to
make the program easier to write:

. Names start at the beginning of the line.
. Names follow these rules:
  . Formatted "Lastname, Firstname"
  . Alphabetic

Names that don't follow those rules can be ignored.



List of Modified Names
--------------------------

Take the first N names from the file where the following is true:

  . No previous name has the same first name.
  . No previous name has the same last name.

  For example, consider these names:

    Smith, Joan
    Smith, John
    Smith, Sam
    Thomas, Joan
    Upton, Joan
    Upton, Tom
    Vasquez, Cesar

  These names would be part of the new list:

    Smith, Joan
    Upton, Tom
    Vasquez, Cesar

  These names would not:

    Smith, John     # Already have a last name "Smith"
    Smith, Sam      # Already have a last name "Smith"
    Thomas, Joan    # Already have a first name "Joan"
    Upton, Joan     # Already have a first name "Joan"

Your program must support an arbitrary value for N, but for your example output
you may use 25.

After you have this list of 25 names, print a new list that contains 25
modified names.  These modified names should only use first names and last
names from the original 25 names.  However, the new list and the old list should
not share any full names.

  For example, if the file contains the names:

    Brutananadilewski, Carl
    Crews, Xander
    Cartman, Eric
    ... 22 more names ...

  Then this is a valid output:

    Brutananadilewski, Eric
    Crews, Carl
    Cartman, Xander
    ... 22 more names ...

  But this is not (because "Barney" and "Bambam" weren't in the original file):

    Brutananadilewski, Fred
    Crews, Barney
    Cartman, Bambam
    ... 22 more names ...

  This is also incorrect (because "Cartman, Eric" is unchanged):

    Brutananadilewski, Xander
    Crews, Carl
    Cartman, Eric
    ... 22 more names ...

  This is also incorrect (because "Carl" is used multiple times):

    Brutananadilewski, Xander
    Crews, Carl
    Cartman, Carl
    ... 22 more names ...



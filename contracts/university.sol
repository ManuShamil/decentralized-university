// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract University {
    uint64 courseIdCounter; //! for keeping track of index for course.
    address contractOwner;
    address payable vaultAddress;

    struct Course {
        uint64 courseId;
        string courseName;
        uint256 fees;
    }

    struct Student {
        address walletAddress;
        uint64 enrolledCourseId;
        bool feesPaid;
    }

    Course[] universityCourses;
    Student[] enrolledStudents;

    constructor() {
        courseIdCounter = 0;
        contractOwner = msg.sender;
        vaultAddress = payable(contractOwner);
    }

    function getFees( string memory courseName ) public view returns( uint256 ) {
        int64 courseIndex = indexOfCourse(courseName);

        if ( courseIndex >= 0)
            return universityCourses[ uint64(courseIndex) ].fees;

        return 0;
    }

    function getOwner() public view returns( address ) {
        return contractOwner;
    }

    function indexOfCourse( string memory courseName ) public view returns ( int64 ) {
        for ( uint64 i=0; i<universityCourses.length; i++ )
            if ( keccak256( abi.encodePacked( universityCourses[i].courseName) ) == keccak256(abi.encodePacked( courseName )) )
                return int64(i);
        return -1;
    }
    
    function getCourseById( uint64 courseId ) public view returns ( string memory, int256 ) {
        if ( courseId >  courseIdCounter )
            return ( "", -1 );

        return ( universityCourses[ courseId ].courseName, int256(universityCourses[ courseId ].fees) );

    }

    function getCourseFees( uint64 courseId ) public view returns ( int256 ) {

        if ( courseId >  courseIdCounter )
            return -1;

        return int256(universityCourses[ courseId ].fees );
    }

    function getCourseCount() public view returns ( uint64 ) {
        return courseIdCounter;
    }


    /**
     * Function to add a new course.
     * - Adds course if it the course doesn't exist.
     * - modifies a course if a course already exists.
     */
    function addCourse( string memory courseName, uint256 fees ) public returns (bool) {
        if ( msg.sender != getOwner() ) return false;

        int64 courseIndex = indexOfCourse(courseName);

        //! if already exists, do update only.
        if ( courseIndex >= 0 ) {
            universityCourses[uint64(courseIndex)].fees = fees;
            return true;
        }

        universityCourses.push(Course( courseIdCounter, courseName, fees ) );

        courseIdCounter = courseIdCounter + 1;

        return true;
    }

    function indexOfStudent( address studentAddress ) private view returns ( int64 ) {
        for ( uint64 i=0; i<enrolledStudents.length; i++ )
            if ( enrolledStudents[i].walletAddress == studentAddress )
                return int64(i);

        return -1;
    }

    function getCourseIdByStudentAddress( address studentAddress ) public view returns ( int64 ) {

        int64 studentIndex =  indexOfStudent(studentAddress);

        if ( studentIndex == -1 ) return -1;


        return int64(enrolledStudents[  uint64( indexOfStudent(studentAddress) ) ].enrolledCourseId);
    } 

    function enroll( uint64 courseId ) public returns ( bool ) {

        address requesterAddress = msg.sender;

        //! course does not exist on the database. 
        if ( courseId > courseIdCounter )
            return false;

        int64 indexStudent = indexOfStudent(requesterAddress);
        //! student has already enrolled for a course, <error>!
        if ( indexStudent >= 0 ) {
            enrolledStudents[ uint256(uint64(indexStudent)) ].enrolledCourseId = courseId;
            return true;
        }

        //! register student for the courseId
        enrolledStudents.push( Student( msg.sender, courseId, false ) );

        return true;
    }

    function getMyFees() public view returns ( int256 ) {

        int64 courseId = getCourseIdByStudentAddress( msg.sender );

        if ( courseId == -1 ) return -1;

        return getCourseFees( uint64( courseId ) ); 
    } 

    function feesPaid( address requesterAddress ) public view returns( bool ) {
        int64 indexStudent = indexOfStudent(requesterAddress);

        if ( indexStudent < 0 ) return false;

        return enrolledStudents[ uint256(uint64(indexStudent)) ].feesPaid;
    }

    function payFees() public payable  {

        require(msg.value ==  uint256(getMyFees()), "Incorrect fee amount.");

        vaultAddress.transfer( uint256(getMyFees()) );

        int64 indexStudent = indexOfStudent( msg.sender );
        if ( indexStudent < 0 ) return;

        enrolledStudents[ uint256(uint64(indexStudent)) ].feesPaid = true;


    }
}
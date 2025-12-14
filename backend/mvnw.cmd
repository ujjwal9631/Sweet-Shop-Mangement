<# : batch script
@echo off
setlocal
set MVNW_VERBOSE=
set MAVEN_BATCH_ECHO=off
@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.2.0
@REM ----------------------------------------------------------------------------

@REM Begin all REM lines with '@' in case MVNW_BATCH_ECHO is 'on'
@echo off

@setlocal

set ERROR_CODE=0

@REM ==== START VALIDATION ====
if not "%JAVA_HOME%"=="" goto OkJHome
echo.
echo Error: JAVA_HOME not found in your environment. >&2
echo Please set the JAVA_HOME variable in your environment to match the >&2
echo location of your Java installation. >&2
echo.
goto error

:OkJHome
if exist "%JAVA_HOME%\bin\java.exe" goto init
echo.
echo Error: JAVA_HOME is set to an invalid directory. >&2
echo JAVA_HOME = "%JAVA_HOME%" >&2
echo Please set the JAVA_HOME variable in your environment to match the >&2
echo location of your Java installation. >&2
echo.
goto error

:init

@REM Find the project base dir, i.e. the directory that contains the folder ".mvn".
set MAVEN_PROJECTBASEDIR=%~dp0
:findBaseDir
if exist "%MAVEN_PROJECTBASEDIR%\.mvn" goto baseDirFound
cd "%MAVEN_PROJECTBASEDIR%\.."
if not "%cd%"=="%MAVEN_PROJECTBASEDIR%" (
    set MAVEN_PROJECTBASEDIR=%cd%
    goto findBaseDir
)
cd "%~dp0"
set MAVEN_PROJECTBASEDIR=%~dp0

:baseDirFound

set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_PROPERTIES="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"

@REM Extension to allow automatically downloading the maven-wrapper.jar from Maven-central
@REM This allows using the maven wrapper in projects that prohibit checking in binary data.
if exist %WRAPPER_JAR% (
    echo Found %WRAPPER_JAR%
) else (
    echo Couldn't find %WRAPPER_JAR%, downloading it ...
    @REM Download the wrapper
    for /F "usebackq tokens=1,2 delims==" %%a in (%WRAPPER_PROPERTIES%) do (
        if "%%a"=="wrapperUrl" set WRAPPER_URL=%%b
    )
    if "%WRAPPER_URL%"=="" (
        set WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar
    )
    powershell -Command "(New-Object Net.WebClient).DownloadFile('%WRAPPER_URL%', '%WRAPPER_JAR%')"
    if errorlevel 1 (
        echo Download failed, please ensure you have powershell and internet access
        goto error
    )
)
@REM End of extension

@REM Check for Maven distribution
set MAVEN_HOME=
for /F "usebackq tokens=1,2 delims==" %%a in (%WRAPPER_PROPERTIES%) do (
    if "%%a"=="distributionUrl" set MAVEN_DIST_URL=%%b
)

@REM Download Maven distribution if not present
set MAVEN_ZIP=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6-bin.zip
set MAVEN_DIR=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6

if exist "%MAVEN_DIR%\bin\mvn.cmd" (
    set MAVEN_HOME=%MAVEN_DIR%
) else (
    echo Downloading Maven...
    if not exist "%USERPROFILE%\.m2\wrapper\dists" mkdir "%USERPROFILE%\.m2\wrapper\dists"
    powershell -Command "(New-Object Net.WebClient).DownloadFile('%MAVEN_DIST_URL%', '%MAVEN_ZIP%')"
    echo Extracting Maven...
    powershell -Command "Expand-Archive -Path '%MAVEN_ZIP%' -DestinationPath '%USERPROFILE%\.m2\wrapper\dists' -Force"
    set MAVEN_HOME=%MAVEN_DIR%
)

"%MAVEN_HOME%\bin\mvn.cmd" %*
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%

exit /B %ERROR_CODE%

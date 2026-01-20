# Mapa Projektu: `inzynierka`

--- 

## `docker-compose.yml`

```yaml
services:
  backend:
    build:
      context: ./sub-manager-backend
      dockerfile: Dockerfile
    container_name: backend
    ports:
      - "8080:8080"
    volumes:
      - ./sub-manager-backend:/app
      - ~/.m2:/root/.m2
    environment:
      - JAVA_OPTS=-Dspring.devtools.restart.enabled=true -Dspring.devtools.livereload.enabled=true
      - SPRING_PROFILES_ACTIVE=dev

      # Those envs are only for dev purposes:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=mydb
      - DB_USERNAME=myuser
      - DB_PASSWORD=mypassword 
      - JWT_SECRET=Hg7GFFGmMETEty+af3KNLD48u0o/f/vMNo9d3R1p/Pw=
      - JWT_EXP_TIME=86400000
    depends_on:
      - postgres
    restart: unless-stopped

  frontend:
    build:
      context: ./sub-manager-front-end
      dockerfile: Dockerfile.dev
    container_name: frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    develop:
      watch:
        - action: sync
          path: ./sub-manager-front-end
          target: /app
          ignore:
            - node_modules/
        - action: rebuild
          path: ./sub-manager-front-end/package.json
          target: /app/package.json
    environment:
      - CHOKIDAR_USEPOLLING=true

  postgres:
    image: postgres:15.3
    container_name: postgres
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    ports:
      - "5050:80"
    environment:
      - PGADMIN_DEFAULT_EMAIL=gabrielgaleza@gmail.com
      - PGADMIN_DEFAULT_PASSWORD=root
    depends_on:
      - postgres
    volumes:
      - pgadmin_data:/var/lib/pgadmin

volumes:
  postgres_data:
  node_modules:
  pgadmin_data:
```

--- 

## `mapa.md`

```markdown

```

--- 

## `ocen.py`

```python
import os
import argparse

# Domyślna lista katalogów i plików do wykluczenia
DEFAULT_EXCLUSIONS = {
    '.git',
    '.next',
    'node_modules',
    '.next',
    '__pycache__',
    '.vscode',
    '.idea',
    '.env',
    '.expo',
    'venv',
    '.DS_Store',
    'package-lock.json',
    'next.config.ts',
    'eslint.config.mjs',
    'tsconfig.json',
    '.gitignore',
    'public',
    'yarn.lock',
    '.idea',
    '.mvn'
}

# Mapowanie rozszerzeń plików na języki dla podświetlania składni w Markdown
EXTENSION_TO_LANG = {
    '.py': 'python',
    '.js': 'javascript',
    '.jsx': 'jsx',
    '.ts': 'typescript',
    '.tsx': 'tsx',
    '.html': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.json': 'json',
    '.xml': 'xml',
    '.md': 'markdown',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.sh': 'shell',
    '.sql': 'sql',
    '.java': 'java',
    '.c': 'c',
    '.cpp': 'cpp',
    '.cs': 'csharp',
    '.go': 'go',
    '.php': 'php',
    '.rb': 'ruby',
    '.rs': 'rust',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.dockerfile': 'dockerfile',
    'Dockerfile': 'dockerfile'
}

def get_language_from_extension(filename):
    """Zwraca nazwę języka na podstawie rozszerzenia pliku."""
    # Sprawdź najpierw pełną nazwę pliku (np. dla Dockerfile)
    if filename in EXTENSION_TO_LANG:
        return EXTENSION_TO_LANG[filename]
    # Potem sprawdź rozszerzenie
    _, ext = os.path.splitext(filename)
    return EXTENSION_TO_LANG.get(ext.lower(), '') # Zwróć pusty string, jeśli nie znaleziono

def map_project_to_md(project_path, output_file, exclusions):
    """
    Mapuje strukturę projektu i zawartość plików do jednego pliku Markdown.

    :param project_path: Ścieżka do katalogu głównego projektu.
    :param output_file: Nazwa pliku wyjściowego .md.
    :param exclusions: Zbiór nazw katalogów i plików do wykluczenia.
    """
    # Upewnij się, że ścieżka projektu jest absolutna i znormalizowana
    project_path = os.path.abspath(project_path)
    
    if not os.path.isdir(project_path):
        print(f"Błąd: Podana ścieżka '{project_path}' nie jest prawidłowym katalogiem.")
        return

    try:
        with open(output_file, 'w', encoding='utf-8') as md_file:
            # Zapisz nagłówek z nazwą projektu
            project_name = os.path.basename(project_path)
            md_file.write(f"# Mapa Projektu: `{project_name}`\n\n")

            # Przechodzenie przez drzewo katalogów
            for root, dirs, files in os.walk(project_path, topdown=True):
                # Kluczowy mechanizm wykluczania: modyfikujemy listę `dirs` w miejscu,
                # aby `os.walk` nie wchodził do tych katalogów.
                dirs[:] = [d for d in dirs if d not in exclusions]

                # Wykluczanie plików
                files_to_process = [f for f in files if f not in exclusions]

                for filename in files_to_process:
                    full_path = os.path.join(root, filename)
                    relative_path = os.path.relpath(full_path, project_path)
                    
                    # Normalizacja separatorów dla spójności (ważne na Windows)
                    relative_path = relative_path.replace('\\', '/')

                    print(f"Przetwarzanie: {relative_path}")

                    # Zapisz ścieżkę do pliku jako nagłówek w Markdown
                    md_file.write(f"--- \n\n")
                    md_file.write(f"## `{relative_path}`\n\n")

                    # Zidentyfikuj język dla podświetlania składni
                    lang = get_language_from_extension(filename)
                    md_file.write(f"```{lang}\n")

                    # Odczytaj i zapisz zawartość pliku
                    try:
                        with open(full_path, 'r', encoding='utf-8', errors='ignore') as f_in:
                            content = f_in.read()
                            md_file.write(content)
                    except Exception as e:
                        md_file.write(f"Nie udało się odczytać pliku: {e}")
                    
                    md_file.write(f"\n```\n\n")

    except IOError as e:
        print(f"Błąd zapisu do pliku '{output_file}': {e}")
    except Exception as e:
        print(f"Wystąpił nieoczekiwany błąd: {e}")

    print(f"\nUkończono! Mapa projektu została zapisana w pliku: {output_file}")


def main():
    """Główna funkcja do obsługi argumentów wiersza poleceń."""
    parser = argparse.ArgumentParser(
        description="Tworzy mapę projektu, łącząc wszystkie pliki w jeden plik Markdown.",
        formatter_class=argparse.RawTextHelpFormatter # Lepsze formatowanie pomocy
    )
    
    parser.add_argument(
        'path',
        type=str,
        help='Ścieżka do katalogu projektu, który ma zostać zmapowany.'
    )
    
    parser.add_argument(
        '-o', '--output',
        type=str,
        default='project_map.md',
        help='Nazwa pliku wyjściowego .md (domyślnie: project_map.md).'
    )
    
    parser.add_argument(
        '-e', '--exclude',
        nargs='+',  # Pozwala na podanie wielu wartości
        default=[],
        help='Dodatkowe nazwy katalogów lub plików do wykluczenia (oddzielone spacjami).\n'
             f"Domyślne wykluczenia to: {', '.join(DEFAULT_EXCLUSIONS)}"
    )

    args = parser.parse_args()
    
    # Połącz domyślne wykluczenia z tymi podanymi przez użytkownika
    all_exclusions = DEFAULT_EXCLUSIONS.union(set(args.exclude))

    map_project_to_md(args.path, args.output, all_exclusions)


if __name__ == '__main__':
    main()
```

--- 

## `README.md`

```markdown
# Subscription Management Application

This application is part of my engineering thesis project. It is designed to help users manage their subscriptions (e.g., Netflix, Spotify) by providing tools for setting up notifications, tracking expenses, and organizing subscription details in an intuitive way.

## Features

- **Subscription Management**: Add, edit, and delete subscription details.
- **Expense Dashboard**: View and track monthly subscription costs in one place.
- **Notifications**: Set up reminders for upcoming payments or subscription renewals.
- **User-Friendly Interface**: Clean and responsive UI for a seamless experience.

---

## Project Architecture

The project is structured into three main components:

### 1. Backend (API)
- **Technology**: [Spring Boot](https://spring.io/projects/spring-boot)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Key Features**:
  - RESTful API for managing subscriptions and user data.
  - Integration with PostgreSQL for persistent storage.

### 2. Frontend
- **Technology**: [Next.js](https://nextjs.org)
- **Key Features**:
  - Responsive design for mobile and desktop users.
  - Interactive dashboard to display expenses and subscription details.
  - Form validation for accurate data entry.
  - API integration with the backend for real-time data synchronization.
## Authors

- [@Gabriel Gałęza](https://www.github.com/YoungVigz)

## License

[MIT](https://choosealicense.com/licenses/mit/)


```

--- 

## `sub-manager-backend/.gitattributes`

```
/mvnw text eol=lf
*.cmd text eol=crlf

```

--- 

## `sub-manager-backend/Dockerfile`

```dockerfile
# Use Maven with OpenJDK 21
FROM maven:3.9.9 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the pom.xml and the source code to the working directory
COPY . .

# Run the Spring Boot application with DevTools enabled
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.profiles=dev", \
     "-Dspring.devtools.restart.enabled=true", \
     "-Dspring.devtools.livereload.enabled=true", \
     "-Dspring.devtools.remote.secret=mysecret"]
```

--- 

## `sub-manager-backend/Dockerfile.prod`

```
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

FROM openjdk:21-jdk-slim

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod

CMD ["java", "-jar", "app.jar"]

```

--- 

## `sub-manager-backend/mvnw`

```
#!/bin/sh
# ----------------------------------------------------------------------------
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
# ----------------------------------------------------------------------------

# ----------------------------------------------------------------------------
# Apache Maven Wrapper startup batch script, version 3.3.2
#
# Optional ENV vars
# -----------------
#   JAVA_HOME - location of a JDK home dir, required when download maven via java source
#   MVNW_REPOURL - repo url base for downloading maven distribution
#   MVNW_USERNAME/MVNW_PASSWORD - user and password for downloading maven
#   MVNW_VERBOSE - true: enable verbose log; debug: trace the mvnw script; others: silence the output
# ----------------------------------------------------------------------------

set -euf
[ "${MVNW_VERBOSE-}" != debug ] || set -x

# OS specific support.
native_path() { printf %s\\n "$1"; }
case "$(uname)" in
CYGWIN* | MINGW*)
  [ -z "${JAVA_HOME-}" ] || JAVA_HOME="$(cygpath --unix "$JAVA_HOME")"
  native_path() { cygpath --path --windows "$1"; }
  ;;
esac

# set JAVACMD and JAVACCMD
set_java_home() {
  # For Cygwin and MinGW, ensure paths are in Unix format before anything is touched
  if [ -n "${JAVA_HOME-}" ]; then
    if [ -x "$JAVA_HOME/jre/sh/java" ]; then
      # IBM's JDK on AIX uses strange locations for the executables
      JAVACMD="$JAVA_HOME/jre/sh/java"
      JAVACCMD="$JAVA_HOME/jre/sh/javac"
    else
      JAVACMD="$JAVA_HOME/bin/java"
      JAVACCMD="$JAVA_HOME/bin/javac"

      if [ ! -x "$JAVACMD" ] || [ ! -x "$JAVACCMD" ]; then
        echo "The JAVA_HOME environment variable is not defined correctly, so mvnw cannot run." >&2
        echo "JAVA_HOME is set to \"$JAVA_HOME\", but \"\$JAVA_HOME/bin/java\" or \"\$JAVA_HOME/bin/javac\" does not exist." >&2
        return 1
      fi
    fi
  else
    JAVACMD="$(
      'set' +e
      'unset' -f command 2>/dev/null
      'command' -v java
    )" || :
    JAVACCMD="$(
      'set' +e
      'unset' -f command 2>/dev/null
      'command' -v javac
    )" || :

    if [ ! -x "${JAVACMD-}" ] || [ ! -x "${JAVACCMD-}" ]; then
      echo "The java/javac command does not exist in PATH nor is JAVA_HOME set, so mvnw cannot run." >&2
      return 1
    fi
  fi
}

# hash string like Java String::hashCode
hash_string() {
  str="${1:-}" h=0
  while [ -n "$str" ]; do
    char="${str%"${str#?}"}"
    h=$(((h * 31 + $(LC_CTYPE=C printf %d "'$char")) % 4294967296))
    str="${str#?}"
  done
  printf %x\\n $h
}

verbose() { :; }
[ "${MVNW_VERBOSE-}" != true ] || verbose() { printf %s\\n "${1-}"; }

die() {
  printf %s\\n "$1" >&2
  exit 1
}

trim() {
  # MWRAPPER-139:
  #   Trims trailing and leading whitespace, carriage returns, tabs, and linefeeds.
  #   Needed for removing poorly interpreted newline sequences when running in more
  #   exotic environments such as mingw bash on Windows.
  printf "%s" "${1}" | tr -d '[:space:]'
}

# parse distributionUrl and optional distributionSha256Sum, requires .mvn/wrapper/maven-wrapper.properties
while IFS="=" read -r key value; do
  case "${key-}" in
  distributionUrl) distributionUrl=$(trim "${value-}") ;;
  distributionSha256Sum) distributionSha256Sum=$(trim "${value-}") ;;
  esac
done <"${0%/*}/.mvn/wrapper/maven-wrapper.properties"
[ -n "${distributionUrl-}" ] || die "cannot read distributionUrl property in ${0%/*}/.mvn/wrapper/maven-wrapper.properties"

case "${distributionUrl##*/}" in
maven-mvnd-*bin.*)
  MVN_CMD=mvnd.sh _MVNW_REPO_PATTERN=/maven/mvnd/
  case "${PROCESSOR_ARCHITECTURE-}${PROCESSOR_ARCHITEW6432-}:$(uname -a)" in
  *AMD64:CYGWIN* | *AMD64:MINGW*) distributionPlatform=windows-amd64 ;;
  :Darwin*x86_64) distributionPlatform=darwin-amd64 ;;
  :Darwin*arm64) distributionPlatform=darwin-aarch64 ;;
  :Linux*x86_64*) distributionPlatform=linux-amd64 ;;
  *)
    echo "Cannot detect native platform for mvnd on $(uname)-$(uname -m), use pure java version" >&2
    distributionPlatform=linux-amd64
    ;;
  esac
  distributionUrl="${distributionUrl%-bin.*}-$distributionPlatform.zip"
  ;;
maven-mvnd-*) MVN_CMD=mvnd.sh _MVNW_REPO_PATTERN=/maven/mvnd/ ;;
*) MVN_CMD="mvn${0##*/mvnw}" _MVNW_REPO_PATTERN=/org/apache/maven/ ;;
esac

# apply MVNW_REPOURL and calculate MAVEN_HOME
# maven home pattern: ~/.m2/wrapper/dists/{apache-maven-<version>,maven-mvnd-<version>-<platform>}/<hash>
[ -z "${MVNW_REPOURL-}" ] || distributionUrl="$MVNW_REPOURL$_MVNW_REPO_PATTERN${distributionUrl#*"$_MVNW_REPO_PATTERN"}"
distributionUrlName="${distributionUrl##*/}"
distributionUrlNameMain="${distributionUrlName%.*}"
distributionUrlNameMain="${distributionUrlNameMain%-bin}"
MAVEN_USER_HOME="${MAVEN_USER_HOME:-${HOME}/.m2}"
MAVEN_HOME="${MAVEN_USER_HOME}/wrapper/dists/${distributionUrlNameMain-}/$(hash_string "$distributionUrl")"

exec_maven() {
  unset MVNW_VERBOSE MVNW_USERNAME MVNW_PASSWORD MVNW_REPOURL || :
  exec "$MAVEN_HOME/bin/$MVN_CMD" "$@" || die "cannot exec $MAVEN_HOME/bin/$MVN_CMD"
}

if [ -d "$MAVEN_HOME" ]; then
  verbose "found existing MAVEN_HOME at $MAVEN_HOME"
  exec_maven "$@"
fi

case "${distributionUrl-}" in
*?-bin.zip | *?maven-mvnd-?*-?*.zip) ;;
*) die "distributionUrl is not valid, must match *-bin.zip or maven-mvnd-*.zip, but found '${distributionUrl-}'" ;;
esac

# prepare tmp dir
if TMP_DOWNLOAD_DIR="$(mktemp -d)" && [ -d "$TMP_DOWNLOAD_DIR" ]; then
  clean() { rm -rf -- "$TMP_DOWNLOAD_DIR"; }
  trap clean HUP INT TERM EXIT
else
  die "cannot create temp dir"
fi

mkdir -p -- "${MAVEN_HOME%/*}"

# Download and Install Apache Maven
verbose "Couldn't find MAVEN_HOME, downloading and installing it ..."
verbose "Downloading from: $distributionUrl"
verbose "Downloading to: $TMP_DOWNLOAD_DIR/$distributionUrlName"

# select .zip or .tar.gz
if ! command -v unzip >/dev/null; then
  distributionUrl="${distributionUrl%.zip}.tar.gz"
  distributionUrlName="${distributionUrl##*/}"
fi

# verbose opt
__MVNW_QUIET_WGET=--quiet __MVNW_QUIET_CURL=--silent __MVNW_QUIET_UNZIP=-q __MVNW_QUIET_TAR=''
[ "${MVNW_VERBOSE-}" != true ] || __MVNW_QUIET_WGET='' __MVNW_QUIET_CURL='' __MVNW_QUIET_UNZIP='' __MVNW_QUIET_TAR=v

# normalize http auth
case "${MVNW_PASSWORD:+has-password}" in
'') MVNW_USERNAME='' MVNW_PASSWORD='' ;;
has-password) [ -n "${MVNW_USERNAME-}" ] || MVNW_USERNAME='' MVNW_PASSWORD='' ;;
esac

if [ -z "${MVNW_USERNAME-}" ] && command -v wget >/dev/null; then
  verbose "Found wget ... using wget"
  wget ${__MVNW_QUIET_WGET:+"$__MVNW_QUIET_WGET"} "$distributionUrl" -O "$TMP_DOWNLOAD_DIR/$distributionUrlName" || die "wget: Failed to fetch $distributionUrl"
elif [ -z "${MVNW_USERNAME-}" ] && command -v curl >/dev/null; then
  verbose "Found curl ... using curl"
  curl ${__MVNW_QUIET_CURL:+"$__MVNW_QUIET_CURL"} -f -L -o "$TMP_DOWNLOAD_DIR/$distributionUrlName" "$distributionUrl" || die "curl: Failed to fetch $distributionUrl"
elif set_java_home; then
  verbose "Falling back to use Java to download"
  javaSource="$TMP_DOWNLOAD_DIR/Downloader.java"
  targetZip="$TMP_DOWNLOAD_DIR/$distributionUrlName"
  cat >"$javaSource" <<-END
	public class Downloader extends java.net.Authenticator
	{
	  protected java.net.PasswordAuthentication getPasswordAuthentication()
	  {
	    return new java.net.PasswordAuthentication( System.getenv( "MVNW_USERNAME" ), System.getenv( "MVNW_PASSWORD" ).toCharArray() );
	  }
	  public static void main( String[] args ) throws Exception
	  {
	    setDefault( new Downloader() );
	    java.nio.file.Files.copy( java.net.URI.create( args[0] ).toURL().openStream(), java.nio.file.Paths.get( args[1] ).toAbsolutePath().normalize() );
	  }
	}
	END
  # For Cygwin/MinGW, switch paths to Windows format before running javac and java
  verbose " - Compiling Downloader.java ..."
  "$(native_path "$JAVACCMD")" "$(native_path "$javaSource")" || die "Failed to compile Downloader.java"
  verbose " - Running Downloader.java ..."
  "$(native_path "$JAVACMD")" -cp "$(native_path "$TMP_DOWNLOAD_DIR")" Downloader "$distributionUrl" "$(native_path "$targetZip")"
fi

# If specified, validate the SHA-256 sum of the Maven distribution zip file
if [ -n "${distributionSha256Sum-}" ]; then
  distributionSha256Result=false
  if [ "$MVN_CMD" = mvnd.sh ]; then
    echo "Checksum validation is not supported for maven-mvnd." >&2
    echo "Please disable validation by removing 'distributionSha256Sum' from your maven-wrapper.properties." >&2
    exit 1
  elif command -v sha256sum >/dev/null; then
    if echo "$distributionSha256Sum  $TMP_DOWNLOAD_DIR/$distributionUrlName" | sha256sum -c >/dev/null 2>&1; then
      distributionSha256Result=true
    fi
  elif command -v shasum >/dev/null; then
    if echo "$distributionSha256Sum  $TMP_DOWNLOAD_DIR/$distributionUrlName" | shasum -a 256 -c >/dev/null 2>&1; then
      distributionSha256Result=true
    fi
  else
    echo "Checksum validation was requested but neither 'sha256sum' or 'shasum' are available." >&2
    echo "Please install either command, or disable validation by removing 'distributionSha256Sum' from your maven-wrapper.properties." >&2
    exit 1
  fi
  if [ $distributionSha256Result = false ]; then
    echo "Error: Failed to validate Maven distribution SHA-256, your Maven distribution might be compromised." >&2
    echo "If you updated your Maven version, you need to update the specified distributionSha256Sum property." >&2
    exit 1
  fi
fi

# unzip and move
if command -v unzip >/dev/null; then
  unzip ${__MVNW_QUIET_UNZIP:+"$__MVNW_QUIET_UNZIP"} "$TMP_DOWNLOAD_DIR/$distributionUrlName" -d "$TMP_DOWNLOAD_DIR" || die "failed to unzip"
else
  tar xzf${__MVNW_QUIET_TAR:+"$__MVNW_QUIET_TAR"} "$TMP_DOWNLOAD_DIR/$distributionUrlName" -C "$TMP_DOWNLOAD_DIR" || die "failed to untar"
fi
printf %s\\n "$distributionUrl" >"$TMP_DOWNLOAD_DIR/$distributionUrlNameMain/mvnw.url"
mv -- "$TMP_DOWNLOAD_DIR/$distributionUrlNameMain" "$MAVEN_HOME" || [ -d "$MAVEN_HOME" ] || die "fail to move MAVEN_HOME"

clean || :
exec_maven "$@"

```

--- 

## `sub-manager-backend/mvnw.cmd`

```
<# : batch portion
@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.3.2
@REM
@REM Optional ENV vars
@REM   MVNW_REPOURL - repo url base for downloading maven distribution
@REM   MVNW_USERNAME/MVNW_PASSWORD - user and password for downloading maven
@REM   MVNW_VERBOSE - true: enable verbose log; others: silence the output
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET __MVNW_CMD__=
@SET __MVNW_ERROR__=
@SET __MVNW_PSMODULEP_SAVE=%PSModulePath%
@SET PSModulePath=
@FOR /F "usebackq tokens=1* delims==" %%A IN (`powershell -noprofile "& {$scriptDir='%~dp0'; $script='%__MVNW_ARG0_NAME__%'; icm -ScriptBlock ([Scriptblock]::Create((Get-Content -Raw '%~f0'))) -NoNewScope}"`) DO @(
  IF "%%A"=="MVN_CMD" (set __MVNW_CMD__=%%B) ELSE IF "%%B"=="" (echo %%A) ELSE (echo %%A=%%B)
)
@SET PSModulePath=%__MVNW_PSMODULEP_SAVE%
@SET __MVNW_PSMODULEP_SAVE=
@SET __MVNW_ARG0_NAME__=
@SET MVNW_USERNAME=
@SET MVNW_PASSWORD=
@IF NOT "%__MVNW_CMD__%"=="" (%__MVNW_CMD__% %*)
@echo Cannot start maven from wrapper >&2 && exit /b 1
@GOTO :EOF
: end batch / begin powershell #>

$ErrorActionPreference = "Stop"
if ($env:MVNW_VERBOSE -eq "true") {
  $VerbosePreference = "Continue"
}

# calculate distributionUrl, requires .mvn/wrapper/maven-wrapper.properties
$distributionUrl = (Get-Content -Raw "$scriptDir/.mvn/wrapper/maven-wrapper.properties" | ConvertFrom-StringData).distributionUrl
if (!$distributionUrl) {
  Write-Error "cannot read distributionUrl property in $scriptDir/.mvn/wrapper/maven-wrapper.properties"
}

switch -wildcard -casesensitive ( $($distributionUrl -replace '^.*/','') ) {
  "maven-mvnd-*" {
    $USE_MVND = $true
    $distributionUrl = $distributionUrl -replace '-bin\.[^.]*$',"-windows-amd64.zip"
    $MVN_CMD = "mvnd.cmd"
    break
  }
  default {
    $USE_MVND = $false
    $MVN_CMD = $script -replace '^mvnw','mvn'
    break
  }
}

# apply MVNW_REPOURL and calculate MAVEN_HOME
# maven home pattern: ~/.m2/wrapper/dists/{apache-maven-<version>,maven-mvnd-<version>-<platform>}/<hash>
if ($env:MVNW_REPOURL) {
  $MVNW_REPO_PATTERN = if ($USE_MVND) { "/org/apache/maven/" } else { "/maven/mvnd/" }
  $distributionUrl = "$env:MVNW_REPOURL$MVNW_REPO_PATTERN$($distributionUrl -replace '^.*'+$MVNW_REPO_PATTERN,'')"
}
$distributionUrlName = $distributionUrl -replace '^.*/',''
$distributionUrlNameMain = $distributionUrlName -replace '\.[^.]*$','' -replace '-bin$',''
$MAVEN_HOME_PARENT = "$HOME/.m2/wrapper/dists/$distributionUrlNameMain"
if ($env:MAVEN_USER_HOME) {
  $MAVEN_HOME_PARENT = "$env:MAVEN_USER_HOME/wrapper/dists/$distributionUrlNameMain"
}
$MAVEN_HOME_NAME = ([System.Security.Cryptography.MD5]::Create().ComputeHash([byte[]][char[]]$distributionUrl) | ForEach-Object {$_.ToString("x2")}) -join ''
$MAVEN_HOME = "$MAVEN_HOME_PARENT/$MAVEN_HOME_NAME"

if (Test-Path -Path "$MAVEN_HOME" -PathType Container) {
  Write-Verbose "found existing MAVEN_HOME at $MAVEN_HOME"
  Write-Output "MVN_CMD=$MAVEN_HOME/bin/$MVN_CMD"
  exit $?
}

if (! $distributionUrlNameMain -or ($distributionUrlName -eq $distributionUrlNameMain)) {
  Write-Error "distributionUrl is not valid, must end with *-bin.zip, but found $distributionUrl"
}

# prepare tmp dir
$TMP_DOWNLOAD_DIR_HOLDER = New-TemporaryFile
$TMP_DOWNLOAD_DIR = New-Item -Itemtype Directory -Path "$TMP_DOWNLOAD_DIR_HOLDER.dir"
$TMP_DOWNLOAD_DIR_HOLDER.Delete() | Out-Null
trap {
  if ($TMP_DOWNLOAD_DIR.Exists) {
    try { Remove-Item $TMP_DOWNLOAD_DIR -Recurse -Force | Out-Null }
    catch { Write-Warning "Cannot remove $TMP_DOWNLOAD_DIR" }
  }
}

New-Item -Itemtype Directory -Path "$MAVEN_HOME_PARENT" -Force | Out-Null

# Download and Install Apache Maven
Write-Verbose "Couldn't find MAVEN_HOME, downloading and installing it ..."
Write-Verbose "Downloading from: $distributionUrl"
Write-Verbose "Downloading to: $TMP_DOWNLOAD_DIR/$distributionUrlName"

$webclient = New-Object System.Net.WebClient
if ($env:MVNW_USERNAME -and $env:MVNW_PASSWORD) {
  $webclient.Credentials = New-Object System.Net.NetworkCredential($env:MVNW_USERNAME, $env:MVNW_PASSWORD)
}
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$webclient.DownloadFile($distributionUrl, "$TMP_DOWNLOAD_DIR/$distributionUrlName") | Out-Null

# If specified, validate the SHA-256 sum of the Maven distribution zip file
$distributionSha256Sum = (Get-Content -Raw "$scriptDir/.mvn/wrapper/maven-wrapper.properties" | ConvertFrom-StringData).distributionSha256Sum
if ($distributionSha256Sum) {
  if ($USE_MVND) {
    Write-Error "Checksum validation is not supported for maven-mvnd. `nPlease disable validation by removing 'distributionSha256Sum' from your maven-wrapper.properties."
  }
  Import-Module $PSHOME\Modules\Microsoft.PowerShell.Utility -Function Get-FileHash
  if ((Get-FileHash "$TMP_DOWNLOAD_DIR/$distributionUrlName" -Algorithm SHA256).Hash.ToLower() -ne $distributionSha256Sum) {
    Write-Error "Error: Failed to validate Maven distribution SHA-256, your Maven distribution might be compromised. If you updated your Maven version, you need to update the specified distributionSha256Sum property."
  }
}

# unzip and move
Expand-Archive "$TMP_DOWNLOAD_DIR/$distributionUrlName" -DestinationPath "$TMP_DOWNLOAD_DIR" | Out-Null
Rename-Item -Path "$TMP_DOWNLOAD_DIR/$distributionUrlNameMain" -NewName $MAVEN_HOME_NAME | Out-Null
try {
  Move-Item -Path "$TMP_DOWNLOAD_DIR/$MAVEN_HOME_NAME" -Destination $MAVEN_HOME_PARENT | Out-Null
} catch {
  if (! (Test-Path -Path "$MAVEN_HOME" -PathType Container)) {
    Write-Error "fail to move MAVEN_HOME"
  }
} finally {
  try { Remove-Item $TMP_DOWNLOAD_DIR -Recurse -Force | Out-Null }
  catch { Write-Warning "Cannot remove $TMP_DOWNLOAD_DIR" }
}

Write-Output "MVN_CMD=$MAVEN_HOME/bin/$MVN_CMD"

```

--- 

## `sub-manager-backend/pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.4.2</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>pl.gabgal</groupId>
	<artifactId>sub-manager-backend</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>sub-manager-backend</name>
	<description>This is an api for sub-manager project</description>
	<url/>
	<licenses>
		<license/>
	</licenses>
	<developers>
		<developer/>
	</developers>
	<scm>
		<connection/>
		<developerConnection/>
		<tag/>
		<url/>
	</scm>
	<properties>
		<java.version>21</java.version>
	</properties>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>

		<dependency>
			<groupId>org.postgresql</groupId>
			<artifactId>postgresql</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-devtools</artifactId>
			<scope>runtime</scope>
			<optional>true</optional>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-validation</artifactId>
		</dependency>

		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-security</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.security</groupId>
			<artifactId>spring-security-test</artifactId>
			<scope>test</scope>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-mail</artifactId>
		</dependency>


		<dependency>
			<groupId>io.jsonwebtoken</groupId>
			<artifactId>jjwt-api</artifactId>
			<version>0.11.5</version>
		</dependency>
		<dependency>
			<groupId>io.jsonwebtoken</groupId>
			<artifactId>jjwt-impl</artifactId>
			<version>0.11.5</version>
			<scope>runtime</scope>
		</dependency>
		<dependency>
			<groupId>io.jsonwebtoken</groupId>
			<artifactId>jjwt-jackson</artifactId>
			<version>0.11.5</version>
			<scope>runtime</scope>
		</dependency>

	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<configuration>
					<excludeDevtools>false</excludeDevtools>
				</configuration>
			</plugin>
		</plugins>
	</build>

</project>

```

--- 

## `sub-manager-backend/sub-manager-backend.iml`

```
<?xml version="1.0" encoding="UTF-8"?>
<module version="4">
  <component name="FacetManager">
    <facet type="jpa" name="JPA">
      <configuration>
        <setting name="validation-enabled" value="true" />
        <setting name="provider-name" value="Hibernate" />
        <datasource-mapping />
        <naming-strategy-map />
      </configuration>
    </facet>
  </component>
</module>
```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/SubManagerBackendApplication.java`

```java
package pl.gabgal.submanager.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SubManagerBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SubManagerBackendApplication.class, args);
	}

}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/config/ApplicationConfig.java`

```java
package pl.gabgal.submanager.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import pl.gabgal.submanager.backend.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;


@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository userRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Bean
    public AuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/config/CorsConfig.java`

```java
package pl.gabgal.submanager.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/config/GlobalExceptionHandler.java`

```java
package pl.gabgal.submanager.backend.config;


import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import pl.gabgal.submanager.backend.dto.ErrorResponse;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUsernameNotFound(UsernameNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("404", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(EntityNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("404", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(InvalidFormatException.class)
    public ResponseEntity<String> handleInvalidFormatException(InvalidFormatException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Invalid input: " + ex.getValue() + ". Allowed values: YEARLY, MONTHLY.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        logger.error("!!!!ERROR ENCOUNTER: ", ex);

        ErrorResponse error = new ErrorResponse("500", "Internal Server Error");
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/config/JwtAuthFilter.java`

```java
package pl.gabgal.submanager.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import pl.gabgal.submanager.backend.service.JwtService;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        final String username = jwtService.extractUserName(jwt);

        if (username != null && !username.isEmpty() && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/config/SecurityConfig.java`

```java
package pl.gabgal.submanager.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(withDefaults()).csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(manager -> manager.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}



/* Last impl
    private final JwtAuthFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    private final AuthenticationConfiguration authenticationConfiguration;

    @Bean
    public AuthenticationManager authenticationManager() throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    */
```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/controller/AuthController.java`

```java
package pl.gabgal.submanager.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.gabgal.submanager.backend.dto.AuthenticationResponse;
import pl.gabgal.submanager.backend.dto.LoginRequest;
import pl.gabgal.submanager.backend.dto.RegisterRequest;
import pl.gabgal.submanager.backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthenticationResponse res = authService.register(request);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthenticationResponse res = authService.login(request);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refresh(@RequestParam("token") String refreshToken) {
        try {
            AuthenticationResponse res = authService.refreshToken(refreshToken);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/validateToken")
    public ResponseEntity<Boolean> validateToken(@RequestParam("token") String token) {
        try {
            Boolean res = authService.validateToken(token);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/controller/CurrencyController.java`

```java
package pl.gabgal.submanager.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.gabgal.submanager.backend.model.Currency;
import pl.gabgal.submanager.backend.service.CurrencyService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/currency")
@RequiredArgsConstructor
public class CurrencyController {

    private final CurrencyService currencyService;

    @CrossOrigin(origins = "*")
    @GetMapping("/")
    public ResponseEntity<List<Currency>> getAllCurrencies() {
        List<Currency> currencies = currencyService.getAllCurrencies();
        return ResponseEntity.ok(currencies);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Currency> getCurrencyById(@PathVariable("id") Long id) {
        Optional<Currency> currency = currencyService.getCurrencyById(id);
        return currency.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Currency> getCurrencyByCode(@PathVariable("code") String code) {
        Optional<Currency> currency = currencyService.getCurrencyByCode(code);
        return currency.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/controller/PaymentsController.java`

```java
package pl.gabgal.submanager.backend.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.gabgal.submanager.backend.dto.PaymentResponse;
import pl.gabgal.submanager.backend.service.PaymentService;

import java.util.List;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentsController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllUserPayments() {
        List<PaymentResponse> pays = paymentService.getUserPayments();
        return ResponseEntity.status(HttpStatus.OK).body(pays);
    }

    @PostMapping("/{id}/process")
    public ResponseEntity<PaymentResponse> processPayment(
            @PathVariable Long id
    ) {
        PaymentResponse result = paymentService.processPayment(id);
        return ResponseEntity.ok(result);
    }
}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/controller/ScheduleController.java`

```java
package pl.gabgal.submanager.backend.controller;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;
import pl.gabgal.submanager.backend.enums.Notify;
import pl.gabgal.submanager.backend.enums.Status;
import pl.gabgal.submanager.backend.model.Payment;
import pl.gabgal.submanager.backend.repository.PaymentRepository;
import pl.gabgal.submanager.backend.service.EmailService;
import pl.gabgal.submanager.backend.service.PaymentService;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Controller
@RequiredArgsConstructor
public class ScheduleController {

    private final PaymentRepository paymentRepository;
    private final EmailService emailService;

    private final PaymentService paymentService;

    @Scheduled(fixedRate = 15000)
    public void notifyUsers() {

        List<Payment> payments = paymentRepository.findUnNotifiedPayments();

        Map<String, List<Map<String, Object>>> userNotifications = new HashMap<>();

        for (Payment payment : payments) {
            payment.setNotificationStatus(Notify.NOTIFIED);
            paymentRepository.save(payment);

            String userEmail = payment.getSubscription().getUser().getEmail();

            Map<String, Object> paymentInfo = new HashMap<>();
            paymentInfo.put("subscription_title", payment.getSubscription().getTitle());
            paymentInfo.put("subscription_price", payment.getSubscription().getPrice());
            paymentInfo.put("payment_date", payment.getDateOfPayment());

            if (userNotifications.get(userEmail) != null) {
                userNotifications.get(userEmail).add(paymentInfo);
            } else {
                userNotifications.computeIfAbsent(userEmail, k -> new ArrayList<>()).add(paymentInfo);
            }
        }


        userNotifications.forEach((userEmail, list) -> {
            try {
                emailService.sendEmail(userEmail, list);
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }
        });
    }

    @Scheduled(fixedRate = 15000)
    public void handleUnprocessedPayments() {
        List<Payment> payments = paymentRepository.findUnprocessedPayments();

        for (Payment payment : payments) {
            payment.setStatus(Status.PAID);
            paymentRepository.save(payment);

            java.sql.Date sqlDate = (java.sql.Date) payment.getDateOfPayment();
            LocalDate currentPaymentDate = sqlDate.toLocalDate();

            LocalDate nextPaymentDate = switch (payment.getSubscription().getCycle()) {
                case MONTHLY -> currentPaymentDate.plusMonths(1);
                case YEARLY  -> currentPaymentDate.plusYears(1);
                default      -> throw new IllegalArgumentException("Unsupported Cycle: " + payment.getSubscription().getCycle());
            };

            java.sql.Date nextDateAsSqlDate = java.sql.Date.valueOf(nextPaymentDate);

            Payment newPayment = new Payment();
            newPayment.setSubscription(payment.getSubscription());
            newPayment.setDateOfPayment(nextDateAsSqlDate);
            newPayment.setStatus(Status.UNPROCESSED);
            newPayment.setNotificationStatus(Notify.UNNOTIFIED);
            paymentRepository.save(newPayment);
        }
    }


}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/controller/SubscriptionController.java`

```java
package pl.gabgal.submanager.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.gabgal.submanager.backend.dto.SubscriptionCreateRequest;
import pl.gabgal.submanager.backend.dto.SubscriptionResponse;
import pl.gabgal.submanager.backend.service.SubscriptionService;

import java.util.List;

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping
    public ResponseEntity<SubscriptionResponse> addSubscription(@Valid @RequestBody SubscriptionCreateRequest subscription) {
        SubscriptionResponse subs = subscriptionService.createSubscription(subscription);
        return ResponseEntity.status(HttpStatus.CREATED).body(subs);
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionResponse>> getAllUserSubscriptions() {
        List<SubscriptionResponse> subs = subscriptionService.getAllSubscriptions();
        return ResponseEntity.status(HttpStatus.OK).body(subs);
    }

    @GetMapping
    @RequestMapping("/{id}")
    public ResponseEntity<SubscriptionResponse> getSubscriptionById(@PathVariable Long id) {
        SubscriptionResponse subs = subscriptionService.getSubscriptionById(id);
        return ResponseEntity.status(HttpStatus.OK).body(subs);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubscription(@PathVariable Long id) {
        subscriptionService.deleteSubscription(id);
        return ResponseEntity.noContent().build();
    }

}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/controller/TestController.java`

```java
package pl.gabgal.submanager.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @CrossOrigin(origins = "*")
    @GetMapping("/")
    public String hello() {
        return "Hello, World!";
    }
}
```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/dto/AuthenticationResponse.java`

```java
package pl.gabgal.submanager.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    private String authenticationToken;
    private String refreshToken;
}
```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/dto/ErrorResponse.java`

```java
package pl.gabgal.submanager.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class ErrorResponse {

    private String code;
    private String message;

}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/dto/LoginRequest.java`

```java
package pl.gabgal.submanager.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Username cannot be empty.")
        String username,

        @NotBlank(message = "Password cannot be empty.")
        String password
) {}
```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/dto/PaymentResponse.java`

```java
package pl.gabgal.submanager.backend.dto;

import pl.gabgal.submanager.backend.enums.Status;

import java.util.Date;

public record PaymentResponse(
        long paymentId,
        Status status,
        Date dateOfPayment,
        long subscriptionId
) {
}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/dto/RegisterRequest.java`

```java
package pl.gabgal.submanager.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Username cannot be empty.")
        @Size(min = 3, max = 20, message = "The username should be 3-20 characters long.")
        String username,

        @NotBlank(message = "E-mail cannot be empty.")
        @Email(message = "Provided e-mail is not valid.")
        String email,

        @NotBlank(message = "Password cannot be empty.")
        @Size(min = 6, message = "Password should be at least 6 characters long.")
        String password
) {}
```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/dto/SubscriptionCreateRequest.java`

```java
package pl.gabgal.submanager.backend.dto;

import jakarta.validation.constraints.*;
import pl.gabgal.submanager.backend.enums.Cycle;
import pl.gabgal.submanager.backend.validator.EnumValid;

import java.util.Date;

public record SubscriptionCreateRequest(

        @NotBlank(message = "Title cannot be blank")
        @Size(max = 75, message = "Title must be at most 75 characters")
        String title,

        @Size(max = 255, message = "Description must be at most 255 characters")
        String description,

        @NotNull(message = "Price must be specified")
        @Positive(message = "Price must be greater than zero")
        float price,

        Cycle cycle,

        @NotNull(message = "Date of last payment is required")
        @PastOrPresent(message = "Date of last payment cannot be in the future")
        Date dateOfLastPayment,

        @Positive(message = "Currency ID must be valid")
        long currencyId
) {
}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/dto/SubscriptionResponse.java`

```java
package pl.gabgal.submanager.backend.dto;

import pl.gabgal.submanager.backend.enums.Cycle;

import java.util.Date;

public record SubscriptionResponse(
        long subscriptionId,
        String title,
        String description,
        float price,
        Cycle cycle,
        Date dateOfLastPayment,
        long currencyId
) {
}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/enums/Cycle.java`

```java
package pl.gabgal.submanager.backend.enums;

public enum Cycle {
    MONTHLY,
    YEARLY
}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/enums/Notify.java`

```java
package pl.gabgal.submanager.backend.enums;

public enum Notify {
    UNNOTIFIED,
    NOTIFIED
}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/enums/Role.java`

```java
package pl.gabgal.submanager.backend.enums;

public enum Role {
    USER,
    ADMIN
}
```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/enums/Status.java`

```java
package pl.gabgal.submanager.backend.enums;

public enum Status {
    UNPROCESSED,
    PAID
}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/model/Currency.java`

```java
package pl.gabgal.submanager.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "currency")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Currency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "currency_id")
    private Long currencyId;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "short_name", nullable = false, unique = true)
    private String shortName;

    @Column(nullable = false)
    private String sign;

    /*
    @OneToMany(mappedBy = "currency", cascade = CascadeType.ALL)
    private List<Subscription> subscriptions;
     */
}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/model/Payment.java`

```java
package pl.gabgal.submanager.backend.model;

import jakarta.persistence.*;
import lombok.*;
import pl.gabgal.submanager.backend.enums.Notify;
import pl.gabgal.submanager.backend.enums.Status;

import java.util.Date;

@Entity
@Table(name = "payment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id", unique = true, nullable = false)
    private long paymentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.UNPROCESSED;

    @Enumerated(EnumType.STRING)
    @Column(name = "notifiaction_status", nullable = false)
    private Notify notificationStatus = Notify.NOTIFIED;

    @Temporal(TemporalType.DATE)
    @Column(name = "date_of_payment", nullable = false)
    private Date dateOfPayment;

    @ManyToOne
    @JoinColumn(name = "subscription_id", nullable = false)
    private Subscription subscription;


}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/model/Subscription.java`

```java
package pl.gabgal.submanager.backend.model;

import jakarta.persistence.*;
import lombok.*;
import pl.gabgal.submanager.backend.enums.Cycle;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subscription_id")
    private long subscriptionId;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private float price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Cycle cycle = Cycle.MONTHLY;

    @Temporal(TemporalType.DATE)
    @Column(name = "date_of_last_payment", nullable = false)
    private Date dateOfLastPayment;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "currency_id", nullable = false)
    private Currency currency;

    @OneToMany(mappedBy = "subscription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Payment> payments = new ArrayList<>();
}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/model/User.java`

```java
package pl.gabgal.submanager.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import pl.gabgal.submanager.backend.enums.Role;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Subscription> subscriptions = new ArrayList<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}



```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/repository/CurrencyRepository.java`

```java
package pl.gabgal.submanager.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.gabgal.submanager.backend.model.Currency;

import java.util.Optional;

public interface CurrencyRepository extends JpaRepository<Currency, Long> {

    Optional<Currency> findByShortName(String shortName);
}
```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/repository/PaymentRepository.java`

```java
package pl.gabgal.submanager.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.gabgal.submanager.backend.model.Payment;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query(value = "SELECT * FROM payment WHERE status = 'UNPROCESSED' AND notifiaction_status = 'UNNOTIFIED' AND DATE(date_of_payment) = CURRENT_DATE + INTERVAL '1 day'", nativeQuery = true)
    List<Payment> findUnNotifiedPayments();

    @Query("SELECT p FROM Payment p WHERE p.subscription.user.userId = :userId")
    List<Payment> findAllByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT * FROM payment WHERE status = 'UNPROCESSED' AND DATE(date_of_payment) = CURRENT_DATE", nativeQuery = true)
    List<Payment> findUnprocessedPayments();

    @Query("SELECT p FROM Payment p JOIN FETCH p.subscription s JOIN FETCH s.user u WHERE p.paymentId = :id")
    Optional<Payment> findByIdWithUser(@Param("id") Long id);

}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/repository/SubscriptionRepository.java`

```java
package pl.gabgal.submanager.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.gabgal.submanager.backend.model.Subscription;

import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    @Query("SELECT s FROM Subscription s WHERE s.user.userId = :userId")
    List<Subscription> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT s FROM Subscription s WHERE s.user.userId = :userId AND s.subscriptionId = :subscriptionId")
    Optional<Subscription> findByIdAndMatchUser(@Param("subscriptionId") Long subscriptionId, @Param("userId") Long userId);

}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/repository/UserRepository.java`

```java
package pl.gabgal.submanager.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;
import pl.gabgal.submanager.backend.enums.Role;
import pl.gabgal.submanager.backend.model.User;
import java.util.Optional;

@Repository
@EnableJpaRepositories
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByRole(Role role);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/service/AuthService.java`

```java
package pl.gabgal.submanager.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pl.gabgal.submanager.backend.dto.AuthenticationResponse;
import pl.gabgal.submanager.backend.dto.LoginRequest;
import pl.gabgal.submanager.backend.dto.RegisterRequest;
import pl.gabgal.submanager.backend.enums.Role;
import pl.gabgal.submanager.backend.model.User;
import pl.gabgal.submanager.backend.repository.UserRepository;

import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .build();

        userRepository.save(user);

        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefresh(new HashMap<>(), user);
        return AuthenticationResponse.builder()
                .authenticationToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }

    public AuthenticationResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );
        var user = userRepository.findByUsername(request.username()).orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefresh(new HashMap<>(), user);
        return AuthenticationResponse.builder()
                .authenticationToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }

    public AuthenticationResponse refreshToken(String refreshToken) {

        var user = userRepository.findByUsername(jwtService.extractUserName(refreshToken)).orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
        var jwtToken = jwtService.generateToken(user);
        var newRefreshToken = jwtService.generateRefresh(new HashMap<>(), user);
        return AuthenticationResponse.builder()
                .authenticationToken(jwtToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    public Boolean validateToken(String token) {
        return jwtService.validateToken(token);
    }
}
```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/service/CurrencyService.java`

```java
package pl.gabgal.submanager.backend.service;

import org.springframework.stereotype.Service;
import pl.gabgal.submanager.backend.model.Currency;
import pl.gabgal.submanager.backend.repository.CurrencyRepository;

import java.util.List;
import java.util.Optional;

@Service
public class CurrencyService {

    private final CurrencyRepository currencyRepository;

    public CurrencyService(CurrencyRepository currencyRepository) {
        this.currencyRepository = currencyRepository;
    }

    public List<Currency> getAllCurrencies() {
        return currencyRepository.findAll();
    }

    public Optional<Currency> getCurrencyById(long id) {
        return currencyRepository.findById(id);
    }

    public Optional<Currency> getCurrencyByCode(String code) {
        return currencyRepository.findByShortName(code);
    }
}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/service/EmailService.java`

```java
package pl.gabgal.submanager.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.MailException;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendEmail(String to, List<Map<String, Object>> data) throws MailException, MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject("Payment Notification");

        StringBuilder text = new StringBuilder();
        text.append("<html><body>");
        text.append("<h3>Hello,</h3>");
        text.append("<p>Here are the subscriptions that will renew soon:</p>");

        data.forEach(sub -> {
            text.append("<hr>");
            text.append("<header><strong>").append(sub.get("subscription_title")).append("</strong></header>");
            text.append("<p><strong>Renewal Date:</strong> ").append(sub.get("payment_date")).append("</p>");
            text.append("<p><strong>Amount:</strong> ").append(sub.get("subscription_price")).append("</p>");
        });

        text.append("</body></html>");

        helper.setText(text.toString(), true);

        mailSender.send(message);
    }


}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/service/JwtService.java`

```java
package pl.gabgal.submanager.backend.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.lang.Objects;
import io.jsonwebtoken.security.Keys;
import io.micrometer.common.util.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private final UserDetailsService userDetailsService;

    public JwtService(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    public String extractUserName(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(
            Map<String, Objects> extraClaims,
            UserDetails userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("roles", userDetails.getAuthorities())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 24)) // 1 day
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUserName(token);
        return (username.equals(userDetails.getUsername()) && isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return !extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {

        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateRefresh(Map<String, Objects> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();

    }

    public Boolean validateToken(String token) {
        String username = extractUserName(token);
        if (StringUtils.isNotEmpty(username) && isTokenExpired(token)) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            return isTokenValid(token, userDetails);
        }
        return false;
    }
}







/* LAST IMPLEMENTATION
    private Key getSigningKey() {
        byte[] keyBytes = Base64.getDecoder().decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("roles", userDetails.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList()))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    */
```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/service/PaymentService.java`

```java
package pl.gabgal.submanager.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import pl.gabgal.submanager.backend.dto.PaymentResponse;
import pl.gabgal.submanager.backend.dto.SubscriptionResponse;
import pl.gabgal.submanager.backend.enums.Cycle;
import pl.gabgal.submanager.backend.enums.Notify;
import pl.gabgal.submanager.backend.enums.Status;
import pl.gabgal.submanager.backend.model.Payment;
import pl.gabgal.submanager.backend.model.Subscription;
import pl.gabgal.submanager.backend.model.User;
import pl.gabgal.submanager.backend.repository.PaymentRepository;
import pl.gabgal.submanager.backend.repository.UserRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    private LocalDate addCycleToDate(Date date, Cycle cycle) {
        LocalDate localDate = date.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();

        localDate = switch (cycle) {
            case MONTHLY -> localDate.plusMonths(1);
            case YEARLY -> localDate.plusYears(1);
        };

        return localDate;
    }

    public List<PaymentResponse> getUserPayments() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();


        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));

        List<Payment> payments = paymentRepository.findAllByUserId(user.getUserId());

        return payments.stream()
                .map(payment -> new PaymentResponse(
                        payment.getPaymentId(),
                        payment.getStatus(),
                        payment.getDateOfPayment(),
                        payment.getSubscription().getSubscriptionId()
                ))
                .collect(Collectors.toList());
    }

    public void createNewPayment(Date date, Subscription subscription, Cycle cycle, boolean isOld) {

        Payment payment = new Payment();
        payment.setSubscription(subscription);

        if(isOld) {
            payment.setDateOfPayment(date);
            payment.setStatus(Status.PAID);
            payment.setNotificationStatus(Notify.NOTIFIED);
        } else {
            LocalDate nextPaymentDate = addCycleToDate(date, cycle);
            payment.setDateOfPayment(java.sql.Date.valueOf(nextPaymentDate));
            payment.setStatus(Status.UNPROCESSED);
            payment.setNotificationStatus(Notify.UNNOTIFIED);
        }

        paymentRepository.save(payment);

    }

    @Transactional
    public PaymentResponse processPayment(Long paymentId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Payment current = paymentRepository
                .findByIdWithUser(paymentId)
                .orElseThrow(() -> new AccessDeniedException("Payment not found"));

        if (!current.getSubscription().getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("You cannot process someone else's payment");
        }

        current.setStatus(Status.PAID);
        current.setNotificationStatus(Notify.NOTIFIED);
        paymentRepository.save(current);

        LocalDate baseDate = ((java.sql.Date) current.getDateOfPayment()).toLocalDate();
        LocalDate nextDate = switch (current.getSubscription().getCycle()) {
            case MONTHLY -> baseDate.plusMonths(1);
            case YEARLY  -> baseDate.plusYears(1);
            default      -> throw new IllegalArgumentException("Unsupported cycle");
        };

        Payment next = new Payment();
        next.setSubscription(current.getSubscription());
        next.setDateOfPayment(java.sql.Date.valueOf(nextDate));
        next.setStatus(Status.UNPROCESSED);
        next.setNotificationStatus(Notify.UNNOTIFIED);
        paymentRepository.save(next);

        return new PaymentResponse(
                next.getPaymentId(),
                next.getStatus(),
                next.getDateOfPayment(),
                next.getSubscription().getSubscriptionId()
        );
    }

}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/service/SubscriptionService.java`

```java
package pl.gabgal.submanager.backend.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import pl.gabgal.submanager.backend.dto.SubscriptionCreateRequest;
import pl.gabgal.submanager.backend.dto.SubscriptionResponse;
import pl.gabgal.submanager.backend.enums.Cycle;
import pl.gabgal.submanager.backend.model.Currency;
import pl.gabgal.submanager.backend.model.Subscription;
import pl.gabgal.submanager.backend.model.User;
import pl.gabgal.submanager.backend.repository.CurrencyRepository;
import pl.gabgal.submanager.backend.repository.SubscriptionRepository;
import pl.gabgal.submanager.backend.repository.UserRepository;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

        private final SubscriptionRepository subscriptionRepository;
        private final UserRepository userRepository;
        private final CurrencyRepository currencyRepository;
        private final PaymentService paymentService;

        public SubscriptionResponse createSubscription(SubscriptionCreateRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));

        Currency currency = currencyRepository.findById(request.currencyId())
                .orElseThrow(() -> new EntityNotFoundException("Currency not found!"));

        Subscription subscription = new Subscription();
        subscription.setTitle(request.title());
        subscription.setDescription(!request.description().isEmpty() ? request.description() : "");
        subscription.setPrice(request.price());
        subscription.setCycle(request.cycle());
        subscription.setDateOfLastPayment(request.dateOfLastPayment());
        subscription.setCurrency(currency);
        subscription.setUser(user);

        Subscription savedSubscription = subscriptionRepository.save(subscription);

        paymentService.createNewPayment(request.dateOfLastPayment(), savedSubscription, request.cycle(), true);
        paymentService.createNewPayment(request.dateOfLastPayment(), savedSubscription, request.cycle(), false);


        return new SubscriptionResponse(
                savedSubscription.getSubscriptionId(),
                savedSubscription.getTitle(),
                savedSubscription.getDescription(),
                savedSubscription.getPrice(),
                savedSubscription.getCycle(),
                savedSubscription.getDateOfLastPayment(),
                currency.getCurrencyId()
        );
        }

        public List<SubscriptionResponse> getAllSubscriptions() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));

        List<Subscription> subscriptions = subscriptionRepository.findAllByUserId(user.getUserId());

        return subscriptions.stream()
                .map(subscription -> new SubscriptionResponse(
                        subscription.getSubscriptionId(),
                        subscription.getTitle(),
                        subscription.getDescription(),
                        subscription.getPrice(),
                        subscription.getCycle(),
                        subscription.getDateOfLastPayment(),
                        subscription.getCurrency().getCurrencyId()
                ))
                .collect(Collectors.toList());
        }

        public SubscriptionResponse getSubscriptionById(long subscriptionId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));

        Subscription subscription = subscriptionRepository.findByIdAndMatchUser(subscriptionId, user.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("Subscription not found!"));

        return new SubscriptionResponse(
                subscription.getSubscriptionId(),
                subscription.getTitle(),
                subscription.getDescription(),
                subscription.getPrice(),
                subscription.getCycle(),
                subscription.getDateOfLastPayment(),
                subscription.getCurrency().getCurrencyId()
        );
        }

        public void deleteSubscription(Long subscriptionId) {
                String username = SecurityContextHolder.getContext().getAuthentication().getName();

                User user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found!"));

                Subscription subscription = subscriptionRepository.findByIdAndMatchUser(subscriptionId, user.getUserId())
                        .orElseThrow(() -> new EntityNotFoundException("Subscription not found or you don't have permission!"));

                subscriptionRepository.delete(subscription);
        }

}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/util/KeyGenerator.java`

```java
package pl.gabgal.submanager.backend.util;

import io.jsonwebtoken.security.Keys;
import java.util.Base64;

public class KeyGenerator {
    public static void main(String[] args) {
        var key = Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS256);
        String base64Key = Base64.getEncoder().encodeToString(key.getEncoded());
        System.out.println("Generated key: " + base64Key);
    }
}
```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/validator/EnumValid.java`

```java
package pl.gabgal.submanager.backend.validator;


import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = EnumValidImpl.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface EnumValid {
    Class<? extends Enum<?>> enumClass();
    String message() default "Invalid value. Must be one of {enumClass}";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

```

--- 

## `sub-manager-backend/src/main/java/pl/gabgal/submanager/backend/validator/EnumValidImpl.java`

```java
package pl.gabgal.submanager.backend.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Arrays;

public class EnumValidImpl implements ConstraintValidator<EnumValid, String> {
    private Enum<?>[] enumValues;

    @Override
    public void initialize(EnumValid annotation) {
        enumValues = annotation.enumClass().getEnumConstants();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return false;
        return Arrays.stream(enumValues)
                .anyMatch(e -> e.name().equalsIgnoreCase(value));
    }
}

```

--- 

## `sub-manager-backend/src/main/resources/application.properties`

```
# General & Dev's
spring.application.name=sub-manager-backend
spring.devtools.restart.enabled=true
spring.devtools.remote.secret=mysecret
logging.level.org.springframework=DEBUG
logging.level.pl.gabgal.submanager=DEBUG

# Database
spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.generate-ddl=true
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.open-in-view=false

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXP_TIME}

# EMAIL TEST
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=submanager.info
spring.mail.password=mtnxoupbxkznmhwj
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

--- 

## `sub-manager-backend/src/test/java/pl/gabgal/submanager/backend/SubManagerBackendApplicationTests.java`

```java
package pl.gabgal.submanager.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class SubManagerBackendApplicationTests {

	@Test
	void contextLoads() {
	}

}

```

--- 

## `sub-manager-backend/target/classes/application.properties`

```
# General & Dev's
spring.application.name=sub-manager-backend
spring.devtools.restart.enabled=true
spring.devtools.remote.secret=mysecret
logging.level.org.springframework=DEBUG
logging.level.pl.gabgal.submanager=DEBUG

# Database
spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.generate-ddl=true
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.open-in-view=false

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXP_TIME}

# EMAIL TEST
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=submanager.info
spring.mail.password=mtnxoupbxkznmhwj
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/SubManagerBackendApplication.class`

```
   A 
      java/lang/Object <init> ()V  9pl/gabgal/submanager/backend/SubManagerBackendApplication
 
   
  *org/springframework/boot/SpringApplication run b(Ljava/lang/Class;[Ljava/lang/String;)Lorg/springframework/context/ConfigurableApplicationContext; Code LineNumberTable LocalVariableTable this ;Lpl/gabgal/submanager/backend/SubManagerBackendApplication; main ([Ljava/lang/String;)V args [Ljava/lang/String; MethodParameters 
SourceFile !SubManagerBackendApplication.java RuntimeVisibleAnnotations >Lorg/springframework/boot/autoconfigure/SpringBootApplication; <Lorg/springframework/scheduling/annotation/EnableScheduling; !               /     *            	             	       6     * 	W       
      
                             
       
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/config/ApplicationConfig.class`

```
   A }      loadUserByUsername {(Lpl/gabgal/submanager/backend/config/ApplicationConfig;)Lorg/springframework/security/core/userdetails/UserDetailsService;  Iorg/springframework/security/authentication/dao/DaoAuthenticationProvider
   	 
 <init> ()V
  
    5pl/gabgal/submanager/backend/config/ApplicationConfig userDetailsService D()Lorg/springframework/security/core/userdetails/UserDetailsService;
     setUserDetailsService E(Lorg/springframework/security/core/userdetails/UserDetailsService;)V
     passwordEncoder @()Lorg/springframework/security/crypto/password/PasswordEncoder;
     setPasswordEncoder A(Lorg/springframework/security/crypto/password/PasswordEncoder;)V
     ! " gorg/springframework/security/config/annotation/authentication/configuration/AuthenticationConfiguration getAuthenticationManager E()Lorg/springframework/security/authentication/AuthenticationManager; $ @org/springframework/security/crypto/bcrypt/BCryptPasswordEncoder
 # 
 '  ( java/lang/Object	  * + , userRepository 8Lpl/gabgal/submanager/backend/repository/UserRepository; . / 0 1 2 6pl/gabgal/submanager/backend/repository/UserRepository findByUsername ((Ljava/lang/String;)Ljava/util/Optional;  4 5 6 get ()Ljava/util/function/Supplier;
 8 9 : ; < java/util/Optional orElseThrow 1(Ljava/util/function/Supplier;)Ljava/lang/Object; > 9org/springframework/security/core/userdetails/UserDetails @ Gorg/springframework/security/core/userdetails/UsernameNotFoundException B User not found
 ? D 	 E (Ljava/lang/String;)V Code LineNumberTable LocalVariableTable this 7Lpl/gabgal/submanager/backend/config/ApplicationConfig; RuntimeVisibleAnnotations -Lorg/springframework/context/annotation/Bean; authenticationProvider F()Lorg/springframework/security/authentication/AuthenticationProvider; provider KLorg/springframework/security/authentication/dao/DaoAuthenticationProvider; authenticationManager (Lorg/springframework/security/config/annotation/authentication/configuration/AuthenticationConfiguration;)Lorg/springframework/security/authentication/AuthenticationManager; config iLorg/springframework/security/config/annotation/authentication/configuration/AuthenticationConfiguration; 
Exceptions W java/lang/Exception MethodParameters ;(Lpl/gabgal/submanager/backend/repository/UserRepository;)V RuntimeInvisibleAnnotations Llombok/Generated; lambda$userDetailsService$1 O(Ljava/lang/String;)Lorg/springframework/security/core/userdetails/UserDetails; username Ljava/lang/String; lambda$userDetailsService$0 K()Lorg/springframework/security/core/userdetails/UsernameNotFoundException; 
SourceFile ApplicationConfig.java 6Lorg/springframework/context/annotation/Configuration; BootstrapMethods ] h
  i \ ] k ()Ljava/lang/Object; m
  n ` a a q
 r s t u v "java/lang/invoke/LambdaMetafactory metafactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invoke/MethodType;)Ljava/lang/invoke/CallSite; InnerClasses y %java/lang/invoke/MethodHandles$Lookup { java/lang/invoke/MethodHandles Lookup !  '     + ,        F   1     *       G        H        I J   K     L    M N  F   Z      Y L+*  +*  +    G            !  " H        I J     O P  K     L    Q R  F   9     +     G       ' H        I J      S T  U     V X    S   K     L       F   2      #Y %    G       , H        I J   K     L    	 Y  F   >     
* &*+ )    G        H       
 I J     
 + ,  X    +  Z     [   \ ]  F   R     * )+ -  3   7 =    G            H        I J      ^ _  U     ?
 ` a  F   "      
 ?YA C    G         b    c K     d   e     p  f g f p  j l o w   
  x z | 
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/config/CorsConfig.class`

```
   A P
      java/lang/Object <init> ()V  .org/springframework/web/cors/CorsConfiguration
    http://localhost:3000 
     java/util/List of $(Ljava/lang/Object;)Ljava/util/List;
     setAllowedOrigins (Ljava/util/List;)V  GET  POST  PUT  DELETE  OPTIONS 
 !  " l(Ljava/lang/Object;Ljava/lang/Object;Ljava/lang/Object;Ljava/lang/Object;Ljava/lang/Object;)Ljava/util/List;
  $ %  setAllowedMethods ' *
  ) *  setAllowedHeaders
 , - . / 0 java/lang/Boolean valueOf (Z)Ljava/lang/Boolean;
  2 3 4 setAllowCredentials (Ljava/lang/Boolean;)V 6 <org/springframework/web/cors/UrlBasedCorsConfigurationSource
 5  9 /**
 5 ; < = registerCorsConfiguration E(Ljava/lang/String;Lorg/springframework/web/cors/CorsConfiguration;)V ? .pl/gabgal/submanager/backend/config/CorsConfig Code LineNumberTable LocalVariableTable this 0Lpl/gabgal/submanager/backend/config/CorsConfig; corsConfigurationSource 8()Lorg/springframework/web/cors/CorsConfigurationSource; 
configuration 0Lorg/springframework/web/cors/CorsConfiguration; source >Lorg/springframework/web/cors/UrlBasedCorsConfigurationSource; RuntimeVisibleAnnotations -Lorg/springframework/context/annotation/Bean; 
SourceFile CorsConfig.java 6Lorg/springframework/context/annotation/Configuration; ! >           @   /     *     A        B        C D    E F  @        D Y 	L+
  +   #+&  (+ + 1 5Y 7M,8+ :,    A   "         "  +  3  ;  B  B        D C D    < G H  ; 	 I J  K     L    M    N K     O  
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/config/GlobalExceptionHandler.class`

```
   A 
      java/lang/Object <init> ()V  .pl/gabgal/submanager/backend/dto/ErrorResponse 
 404
  
    Gorg/springframework/security/core/userdetails/UsernameNotFoundException 
getMessage ()Ljava/lang/String;
     '(Ljava/lang/String;Ljava/lang/String;)V  'org/springframework/http/ResponseEntity	      #org/springframework/http/HttpStatus 	NOT_FOUND %Lorg/springframework/http/HttpStatus;
     >(Ljava/lang/Object;Lorg/springframework/http/HttpStatusCode;)V
   
 ! +jakarta/persistence/EntityNotFoundException # java/util/HashMap
 " 
 & ' ( ) * <org/springframework/web/bind/MethodArgumentNotValidException getBindingResult 0()Lorg/springframework/validation/BindingResult; , - . / 0 ,org/springframework/validation/BindingResult getFieldErrors ()Ljava/util/List;   2 3 4 accept .(Ljava/util/Map;)Ljava/util/function/Consumer; 6 7 8 9 : java/util/List forEach  (Ljava/util/function/Consumer;)V
  < = > 
badRequest 7()Lorg/springframework/http/ResponseEntity$BodyBuilder; @ A B C D 3org/springframework/http/ResponseEntity$BodyBuilder body =(Ljava/lang/Object;)Lorg/springframework/http/ResponseEntity;	  F G  BAD_REQUEST
  I J K status `(Lorg/springframework/http/HttpStatusCode;)Lorg/springframework/http/ResponseEntity$BodyBuilder;
 M N O P Q 9com/fasterxml/jackson/databind/exc/InvalidFormatException getValue ()Ljava/lang/Object;
 S T U V W java/lang/String valueOf &(Ljava/lang/Object;)Ljava/lang/String;  Y Z [ makeConcatWithConstants &(Ljava/lang/String;)Ljava/lang/String;	 ] ^ _ ` a :pl/gabgal/submanager/backend/config/GlobalExceptionHandler logger Lorg/slf4j/Logger; c !!!!ERROR ENCOUNTER:  e f g h i org/slf4j/Logger error *(Ljava/lang/String;Ljava/lang/Throwable;)V k 500 m Internal Server Error	  o p  INTERNAL_SERVER_ERROR
 r s t u  )org/springframework/validation/FieldError getField
 r w x  getDefaultMessage z { | } ~ 
java/util/Map put 8(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
      org/slf4j/LoggerFactory 	getLogger %(Ljava/lang/Class;)Lorg/slf4j/Logger; Code LineNumberTable LocalVariableTable this <Lpl/gabgal/submanager/backend/config/GlobalExceptionHandler; handleUsernameNotFound t(Lorg/springframework/security/core/userdetails/UsernameNotFoundException;)Lorg/springframework/http/ResponseEntity; ex ILorg/springframework/security/core/userdetails/UsernameNotFoundException; 0Lpl/gabgal/submanager/backend/dto/ErrorResponse; MethodParameters 	Signature (Lorg/springframework/security/core/userdetails/UsernameNotFoundException;)Lorg/springframework/http/ResponseEntity<Lpl/gabgal/submanager/backend/dto/ErrorResponse;>; RuntimeVisibleAnnotations :Lorg/springframework/web/bind/annotation/ExceptionHandler; value handleEntityNotFound X(Ljakarta/persistence/EntityNotFoundException;)Lorg/springframework/http/ResponseEntity; -Ljakarta/persistence/EntityNotFoundException; (Ljakarta/persistence/EntityNotFoundException;)Lorg/springframework/http/ResponseEntity<Lpl/gabgal/submanager/backend/dto/ErrorResponse;>; handleValidationExceptions i(Lorg/springframework/web/bind/MethodArgumentNotValidException;)Lorg/springframework/http/ResponseEntity; >Lorg/springframework/web/bind/MethodArgumentNotValidException; errors Ljava/util/Map; LocalVariableTypeTable 5Ljava/util/Map<Ljava/lang/String;Ljava/lang/String;>; (Lorg/springframework/web/bind/MethodArgumentNotValidException;)Lorg/springframework/http/ResponseEntity<Ljava/util/Map<Ljava/lang/String;Ljava/lang/String;>;>; handleInvalidFormatException f(Lcom/fasterxml/jackson/databind/exc/InvalidFormatException;)Lorg/springframework/http/ResponseEntity; ;Lcom/fasterxml/jackson/databind/exc/InvalidFormatException; z(Lcom/fasterxml/jackson/databind/exc/InvalidFormatException;)Lorg/springframework/http/ResponseEntity<Ljava/lang/String;>; handleGenericException @(Ljava/lang/Exception;)Lorg/springframework/http/ResponseEntity; Ljava/lang/Exception; r(Ljava/lang/Exception;)Lorg/springframework/http/ResponseEntity<Lpl/gabgal/submanager/backend/dto/ErrorResponse;>; #lambda$handleValidationExceptions$0 =(Ljava/util/Map;Lorg/springframework/validation/FieldError;)V +Lorg/springframework/validation/FieldError; <clinit> 
SourceFile GlobalExceptionHandler.java :Lorg/springframework/web/bind/annotation/ControllerAdvice; BootstrapMethods  (Ljava/lang/Object;)V 
 ]     .(Lorg/springframework/validation/FieldError;)V  2Invalid input: . Allowed values: YEARLY, MONTHLY. 
      "java/lang/invoke/LambdaMetafactory metafactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invoke/MethodType;)Ljava/lang/invoke/CallSite; 
    Z  $java/lang/invoke/StringConcatFactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/invoke/CallSite; InnerClasses BodyBuilder  %java/lang/invoke/MethodHandles$Lookup  java/lang/invoke/MethodHandles Lookup ! ]      ` a           /     *                                \      Y	+  M Y,         
                            h                      [ c         \      Y	+  M Y,         
       !                      h                      [ c         ~     & "Y $M+ % + , 1   5  ;, ?            &  '  +         &       &                                      [ c         X      E H+ L R X   ?            0  1  2  0                                      [ c         i     # \b+ d  Yjl M Y, n            7  9  :         #       #      h                      [ c 
       D     *+ q+ v y W           (                h          !      	]  \                                            @  	    
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/config/JwtAuthFilter.class`

```
   A   
Authorization      'jakarta/servlet/http/HttpServletRequest 	getHeader &(Ljava/lang/String;)Ljava/lang/String; 
 Bearer 
  
    java/lang/String 
startsWith (Ljava/lang/String;)Z      jakarta/servlet/FilterChain doFilter D(Ljakarta/servlet/ServletRequest;Ljakarta/servlet/ServletResponse;)V
     	substring (I)Ljava/lang/String;	       1pl/gabgal/submanager/backend/config/JwtAuthFilter 
jwtService 1Lpl/gabgal/submanager/backend/service/JwtService;
 " # $ %  /pl/gabgal/submanager/backend/service/JwtService extractUserName
  ' ( ) isEmpty ()Z
 + , - . / ?org/springframework/security/core/context/SecurityContextHolder 
getContext =()Lorg/springframework/security/core/context/SecurityContext; 1 2 3 4 5 9org/springframework/security/core/context/SecurityContext getAuthentication 4()Lorg/springframework/security/core/Authentication;	  7 8 9 userDetailsService BLorg/springframework/security/core/userdetails/UserDetailsService; ; < = > ? @org/springframework/security/core/userdetails/UserDetailsService loadUserByUsername O(Ljava/lang/String;)Lorg/springframework/security/core/userdetails/UserDetails;
 " A B C isTokenValid b(Ljava/lang/String;Lorg/springframework/security/core/userdetails/UserDetails;)Ljava/lang/Boolean;
 E F G H ) java/lang/Boolean booleanValue J Oorg/springframework/security/authentication/UsernamePasswordAuthenticationToken L M N O P 9org/springframework/security/core/userdetails/UserDetails getAuthorities ()Ljava/util/Collection;
 I R S T <init> =(Ljava/lang/Object;Ljava/lang/Object;Ljava/util/Collection;)V V Norg/springframework/security/web/authentication/WebAuthenticationDetailsSource
 U X S Y ()V
 U [ \ ] buildDetails u(Ljakarta/servlet/http/HttpServletRequest;)Lorg/springframework/security/web/authentication/WebAuthenticationDetails;
 I _ ` a 
setDetails (Ljava/lang/Object;)V 1 c d e setAuthentication 5(Lorg/springframework/security/core/Authentication;)V
 g X h 3org/springframework/web/filter/OncePerRequestFilter doFilterInternal s(Ljakarta/servlet/http/HttpServletRequest;Ljakarta/servlet/http/HttpServletResponse;Ljakarta/servlet/FilterChain;)V Code LineNumberTable LocalVariableTable 	authToken QLorg/springframework/security/authentication/UsernamePasswordAuthenticationToken; userDetails ;Lorg/springframework/security/core/userdetails/UserDetails; this 3Lpl/gabgal/submanager/backend/config/JwtAuthFilter; request )Ljakarta/servlet/http/HttpServletRequest; response *Ljakarta/servlet/http/HttpServletResponse; filterChain Ljakarta/servlet/FilterChain; 
authHeader Ljava/lang/String; jwt username 
StackMapTable 
Exceptions   jakarta/servlet/ServletException  java/io/IOException MethodParameters "RuntimeVisibleParameterAnnotations "Lorg/springframework/lang/NonNull; v(Lpl/gabgal/submanager/backend/service/JwtService;Lorg/springframework/security/core/userdetails/UserDetailsService;)V RuntimeInvisibleAnnotations Llombok/Generated; 
SourceFile JwtAuthFilter.java RuntimeVisibleAnnotations *Lorg/springframework/stereotype/Component; !  g           8 9     i j  k  l  	   +  : 
	  -+,   :*  !: a & Y * 0  N* 6 : :*  @ D 0 IY K  Q: UY W+ Z ^ * b -+,      l   >    " 
 $  % ! & " ) + * 6 , N - [ . l / u 0  2  3  7  8 m   \ 	   n o  [ > p q     r s      t u     v w     x y  
  z {  + w | {  6 l } {  ~       v             
 t   v   x                    S   k   M     * f*+ *, 6    l        m         r s             8 9     	   8                       
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/config/SecurityConfig.class`

```
   A       .org/springframework/security/config/Customizer withDefaults 2()Lorg/springframework/security/config/Customizer;
  	 
   Horg/springframework/security/config/annotation/web/builders/HttpSecurity cors |(Lorg/springframework/security/config/Customizer;)Lorg/springframework/security/config/annotation/web/builders/HttpSecurity;      	customize
     csrf  
     authorizeHttpRequests  
     sessionManagement	       2pl/gabgal/submanager/backend/config/SecurityConfig authenticationProvider DLorg/springframework/security/authentication/AuthenticationProvider;
  "  # (Lorg/springframework/security/authentication/AuthenticationProvider;)Lorg/springframework/security/config/annotation/web/builders/HttpSecurity;	  % & ' 
jwtAuthFilter 3Lpl/gabgal/submanager/backend/config/JwtAuthFilter; ) Torg/springframework/security/web/authentication/UsernamePasswordAuthenticationFilter
  + , - addFilterBefore u(Ljakarta/servlet/Filter;Ljava/lang/Class;)Lorg/springframework/security/config/annotation/web/builders/HttpSecurity;
  / 0 1 build ()Ljava/lang/Object; 3 4org/springframework/security/web/SecurityFilterChain
 5 6 7 8 9 java/lang/Object <init> ()V	 ; < = > ? >org/springframework/security/config/http/SessionCreationPolicy 	STATELESS @Lorg/springframework/security/config/http/SessionCreationPolicy;
 A B C D E Zorg/springframework/security/config/annotation/web/configurers/SessionManagementConfigurer sessionCreationPolicy (Lorg/springframework/security/config/http/SessionCreationPolicy;)Lorg/springframework/security/config/annotation/web/configurers/SessionManagementConfigurer; G java/lang/String I /api/auth/**
 K L M N O org/springframework/security/config/annotation/web/configurers/AuthorizeHttpRequestsConfigurer$AuthorizationManagerRequestMatcherRegistry requestMatchers '([Ljava/lang/String;)Ljava/lang/Object; Q lorg/springframework/security/config/annotation/web/configurers/AuthorizeHttpRequestsConfigurer$AuthorizedUrl
 P S T U 	permitAll ()Lorg/springframework/security/config/annotation/web/configurers/AuthorizeHttpRequestsConfigurer$AuthorizationManagerRequestMatcherRegistry;
 K W X 1 
anyRequest
 P Z [ U 
authenticated securityFilterChain (Lorg/springframework/security/config/annotation/web/builders/HttpSecurity;)Lorg/springframework/security/web/SecurityFilterChain; Code LineNumberTable LocalVariableTable this 4Lpl/gabgal/submanager/backend/config/SecurityConfig; http JLorg/springframework/security/config/annotation/web/builders/HttpSecurity; 
Exceptions g java/lang/Exception MethodParameters RuntimeVisibleAnnotations -Lorg/springframework/context/annotation/Bean; z(Lpl/gabgal/submanager/backend/config/JwtAuthFilter;Lorg/springframework/security/authentication/AuthenticationProvider;)V RuntimeInvisibleAnnotations Llombok/Generated; lambda$securityFilterChain$1 _(Lorg/springframework/security/config/annotation/web/configurers/SessionManagementConfigurer;)V manager \Lorg/springframework/security/config/annotation/web/configurers/SessionManagementConfigurer; lambda$securityFilterChain$0 (Lorg/springframework/security/config/annotation/web/configurers/AuthorizeHttpRequestsConfigurer$AuthorizationManagerRequestMatcherRegistry;)V auth Lorg/springframework/security/config/annotation/web/configurers/AuthorizeHttpRequestsConfigurer$AuthorizationManagerRequestMatcherRegistry; 
SourceFile SecurityConfig.java 6Lorg/springframework/context/annotation/Configuration; TLorg/springframework/security/config/annotation/web/configuration/EnableWebSecurity; BootstrapMethods | (Ljava/lang/Object;)V ~
      Uorg/springframework/security/config/annotation/web/configurers/AbstractHttpConfigurer disable J()Lorg/springframework/security/config/annotation/web/HttpSecurityBuilder;  R(Lorg/springframework/security/config/annotation/web/configurers/CsrfConfigurer;)V 
   r s s 
   n o o 
      "java/lang/invoke/LambdaMetafactory metafactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invoke/MethodType;)Ljava/lang/invoke/CallSite; InnerClasses  ^org/springframework/security/config/annotation/web/configurers/AuthorizeHttpRequestsConfigurer *AuthorizationManagerRequestMatcherRegistry 
AuthorizedUrl  %java/lang/invoke/MethodHandles$Lookup  java/lang/invoke/MethodHandles Lookup !  5     & '           \ ]  ^        8+   
           *  !* $( *W+ . 2    _            #   , ! 0 # `       8 a b     8 c d  e     f h    c   i     j    8 k  ^   M     * 4*+ $*,     _        `         a b      & '         h   	 &    l     m  
 n o  ^   3     	* : @W    _        `       	 p q  
 r s  ^   P     * FYHS J P R V P YW    _        
    `        t u    v    w i   
  x   y   z        { }    {     {        K    P       
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/controller/AuthController.class`

```
   A n	      6pl/gabgal/submanager/backend/controller/AuthController authService 2Lpl/gabgal/submanager/backend/service/AuthService;
  	 
   0pl/gabgal/submanager/backend/service/AuthService register m(Lpl/gabgal/submanager/backend/dto/RegisterRequest;)Lpl/gabgal/submanager/backend/dto/AuthenticationResponse;
      'org/springframework/http/ResponseEntity ok =(Ljava/lang/Object;)Lorg/springframework/http/ResponseEntity;  java/lang/Exception	      #org/springframework/http/HttpStatus INTERNAL_SERVER_ERROR %Lorg/springframework/http/HttpStatus;
     status `(Lorg/springframework/http/HttpStatusCode;)Lorg/springframework/http/ResponseEntity$BodyBuilder;   ! " # $ 3org/springframework/http/ResponseEntity$BodyBuilder build +()Lorg/springframework/http/ResponseEntity;
  & ' ( login j(Lpl/gabgal/submanager/backend/dto/LoginRequest;)Lpl/gabgal/submanager/backend/dto/AuthenticationResponse;
  * + , refreshToken M(Ljava/lang/String;)Lpl/gabgal/submanager/backend/dto/AuthenticationResponse;
  . / 0 
validateToken '(Ljava/lang/String;)Ljava/lang/Boolean;	  2 3  UNAUTHORIZED
 5 6 7 8 9 java/lang/Object <init> ()V ](Lpl/gabgal/submanager/backend/dto/RegisterRequest;)Lorg/springframework/http/ResponseEntity; Code LineNumberTable LocalVariableTable res 9Lpl/gabgal/submanager/backend/dto/AuthenticationResponse; e Ljava/lang/Exception; this 8Lpl/gabgal/submanager/backend/controller/AuthController; request 2Lpl/gabgal/submanager/backend/dto/RegisterRequest; 
StackMapTable MethodParameters 	Signature (Lpl/gabgal/submanager/backend/dto/RegisterRequest;)Lorg/springframework/http/ResponseEntity<Lpl/gabgal/submanager/backend/dto/AuthenticationResponse;>; RuntimeVisibleAnnotations 5Lorg/springframework/web/bind/annotation/PostMapping; value 	/register RuntimeVisibleTypeAnnotations Ljakarta/validation/Valid; "RuntimeVisibleParameterAnnotations 5Lorg/springframework/web/bind/annotation/RequestBody; Z(Lpl/gabgal/submanager/backend/dto/LoginRequest;)Lorg/springframework/http/ResponseEntity; /Lpl/gabgal/submanager/backend/dto/LoginRequest; (Lpl/gabgal/submanager/backend/dto/LoginRequest;)Lorg/springframework/http/ResponseEntity<Lpl/gabgal/submanager/backend/dto/AuthenticationResponse;>; /login refresh =(Ljava/lang/String;)Lorg/springframework/http/ResponseEntity; Ljava/lang/String; x(Ljava/lang/String;)Lorg/springframework/http/ResponseEntity<Lpl/gabgal/submanager/backend/dto/AuthenticationResponse;>; /refresh 6Lorg/springframework/web/bind/annotation/RequestParam; token Ljava/lang/Boolean; R(Ljava/lang/String;)Lorg/springframework/http/ResponseEntity<Ljava/lang/Boolean;>; 4Lorg/springframework/web/bind/annotation/GetMapping; /validateToken 5(Lpl/gabgal/submanager/backend/service/AuthService;)V RuntimeInvisibleAnnotations Llombok/Generated; 
SourceFile AuthController.java 8Lorg/springframework/web/bind/annotation/RestController; 8Lorg/springframework/web/bind/annotation/RequestMapping; 	/api/auth 5Lorg/springframework/web/bind/annotation/CrossOrigin; origins * InnerClasses BodyBuilder !  5            :  ;        * + M, 
M        
    <        	      =   *  	  > ?    @ A     B C      D E  F    N  G    D   H    I J     K  L[ s M N   	    O   P     O   Q    ' R  ;        * + %M, 
M        
    <       ! 	 "  #  $ =   *  	  > ?    @ A     B C      D S  F    N  G    D   H    T J     K  L[ s U N   	    O   P     O   Q    V W  ;        * + )M, 
M        
    <       + 	 ,  -  . =   *  	  > ?    @ A     B C      + X  F    N  G    +   H    Y J     K  L[ s Z P     [  Ls \  / W  ;        * + -M, 
M 1       
    <       5 	 6  7  8 =   *  	  > ]    @ A     B C      \ X  F    N  G    \   H    ^ J     _  L[ s ` P     [  Ls \  8 a  ;   >     
* 4*+     <        =       
 B C     
    G      b     c    d    e J     f   g  L[ s h i  j[ s k l   
     m	
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/controller/CurrencyController.class`

```
   A 	      :pl/gabgal/submanager/backend/controller/CurrencyController currencyService 6Lpl/gabgal/submanager/backend/service/CurrencyService;
  	 
   4pl/gabgal/submanager/backend/service/CurrencyService getAllCurrencies ()Ljava/util/List;
      'org/springframework/http/ResponseEntity ok =(Ljava/lang/Object;)Lorg/springframework/http/ResponseEntity;
      java/lang/Long 	longValue ()J
     getCurrencyById (J)Ljava/util/Optional;       apply ()Ljava/util/function/Function;
 " # $ % & java/util/Optional map 3(Ljava/util/function/Function;)Ljava/util/Optional;  ( ) * get ()Ljava/util/function/Supplier;
 " , - . 	orElseGet 1(Ljava/util/function/Supplier;)Ljava/lang/Object;
  0 1 2 getCurrencyByCode ((Ljava/lang/String;)Ljava/util/Optional;  (
 5 6 7 8 9 java/lang/Object <init> ()V
  ; < = notFound :()Lorg/springframework/http/ResponseEntity$HeadersBuilder; ? @ A B C 6org/springframework/http/ResponseEntity$HeadersBuilder build +()Lorg/springframework/http/ResponseEntity; Code LineNumberTable LocalVariableTable this <Lpl/gabgal/submanager/backend/controller/CurrencyController; 
currencies Ljava/util/List; LocalVariableTypeTable ?Ljava/util/List<Lpl/gabgal/submanager/backend/model/Currency;>; 	Signature l()Lorg/springframework/http/ResponseEntity<Ljava/util/List<Lpl/gabgal/submanager/backend/model/Currency;>;>; RuntimeVisibleAnnotations 5Lorg/springframework/web/bind/annotation/CrossOrigin; origins * 4Lorg/springframework/web/bind/annotation/GetMapping; value / ;(Ljava/lang/Long;)Lorg/springframework/http/ResponseEntity; id Ljava/lang/Long; currency Ljava/util/Optional; CLjava/util/Optional<Lpl/gabgal/submanager/backend/model/Currency;>; MethodParameters j(Ljava/lang/Long;)Lorg/springframework/http/ResponseEntity<Lpl/gabgal/submanager/backend/model/Currency;>; /{id} "RuntimeVisibleParameterAnnotations 6Lorg/springframework/web/bind/annotation/PathVariable; =(Ljava/lang/String;)Lorg/springframework/http/ResponseEntity; code Ljava/lang/String; l(Ljava/lang/String;)Lorg/springframework/http/ResponseEntity<Lpl/gabgal/submanager/backend/model/Currency;>; /code/{code} 9(Lpl/gabgal/submanager/backend/service/CurrencyService;)V RuntimeInvisibleAnnotations Llombok/Generated; lambda$getCurrencyByCode$1 lambda$getCurrencyById$0 
SourceFile CurrencyController.java 8Lorg/springframework/web/bind/annotation/RestController; 8Lorg/springframework/web/bind/annotation/RequestMapping; 
/api/currency BootstrapMethods r &(Ljava/lang/Object;)Ljava/lang/Object; 
 u X(Lpl/gabgal/submanager/backend/model/Currency;)Lorg/springframework/http/ResponseEntity; w ()Ljava/lang/Object; y
  z j C C }
  ~ i C 
      "java/lang/invoke/LambdaMetafactory metafactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invoke/MethodType;)Ljava/lang/invoke/CallSite; InnerClasses HeadersBuilder  %java/lang/invoke/MethodHandles$Lookup  java/lang/invoke/MethodHandles Lookup !  5            C  D   W     
*  L+ 
    E   
       F       
 G H     I J  K       I L  M    N O     P  Q[ s R S  T[ s U   V  D   u     !* +  M,    ! '   +     E   
       F        ! G H     ! W X    Y Z  K       Y [  \    W   M    ] O     S  T[ s ^ _     `  Ts W  1 a  D   r     * + /M,    ! 3   +     E   
    " 	 # F         G H      b c  	  Y Z  K     	  Y [  \    b   M    d O     S  T[ s e _     `  Ts b  8 f  D   >     
* 4*+     E        F       
 G H     
    \      g     h  
 i C  D   !      	 : >     E       #
 j C  D   !      	 : >     E         k    l O     m   n  T[ s o p        q s t   v x {   v | {      ?  	    
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/controller/PaymentsController.class`

```
   A Q	      :pl/gabgal/submanager/backend/controller/PaymentsController paymentService 5Lpl/gabgal/submanager/backend/service/PaymentService;
  	 
   3pl/gabgal/submanager/backend/service/PaymentService getUserPayments ()Ljava/util/List;	      #org/springframework/http/HttpStatus OK %Lorg/springframework/http/HttpStatus;
      'org/springframework/http/ResponseEntity status `(Lorg/springframework/http/HttpStatusCode;)Lorg/springframework/http/ResponseEntity$BodyBuilder;      3org/springframework/http/ResponseEntity$BodyBuilder body =(Ljava/lang/Object;)Lorg/springframework/http/ResponseEntity;
    ! " processPayment D(Ljava/lang/Long;)Lpl/gabgal/submanager/backend/dto/PaymentResponse;
  $ %  ok
 ' ( ) * + java/lang/Object <init> ()V getAllUserPayments +()Lorg/springframework/http/ResponseEntity; Code LineNumberTable LocalVariableTable this <Lpl/gabgal/submanager/backend/controller/PaymentsController; pays Ljava/util/List; LocalVariableTypeTable DLjava/util/List<Lpl/gabgal/submanager/backend/dto/PaymentResponse;>; 	Signature q()Lorg/springframework/http/ResponseEntity<Ljava/util/List<Lpl/gabgal/submanager/backend/dto/PaymentResponse;>;>; RuntimeVisibleAnnotations 4Lorg/springframework/web/bind/annotation/GetMapping; ;(Ljava/lang/Long;)Lorg/springframework/http/ResponseEntity; id Ljava/lang/Long; result 2Lpl/gabgal/submanager/backend/dto/PaymentResponse; MethodParameters o(Ljava/lang/Long;)Lorg/springframework/http/ResponseEntity<Lpl/gabgal/submanager/backend/dto/PaymentResponse;>; 5Lorg/springframework/web/bind/annotation/PostMapping; value 
/{id}/process "RuntimeVisibleParameterAnnotations 6Lorg/springframework/web/bind/annotation/PathVariable; 8(Lpl/gabgal/submanager/backend/service/PaymentService;)V RuntimeInvisibleAnnotations Llombok/Generated; 
SourceFile PaymentsController.java 8Lorg/springframework/web/bind/annotation/RestController; 8Lorg/springframework/web/bind/annotation/RequestMapping; /api/payment InnerClasses BodyBuilder !  '           , -  .   _     *  L 
 +      /   
       0        1 2    
 3 4  5      
 3 6  7    8 9     :    ! ;  .   P     * + M, #    /   
     	  0         1 2      < =  	  > ?  @    <   7    A 9     B  C[ s D E     F    * G  .   >     
* &*+     /        0       
 1 2     
    @      H     I    J    K 9     L   M  C[ s N O   
    P	
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/controller/ScheduleController$1.class`

```
   A )
      (pl/gabgal/submanager/backend/enums/Cycle values -()[Lpl/gabgal/submanager/backend/enums/Cycle;	  	 
   <pl/gabgal/submanager/backend/controller/ScheduleController$1 3$SwitchMap$pl$gabgal$submanager$backend$enums$Cycle [I	     MONTHLY *Lpl/gabgal/submanager/backend/enums/Cycle;
     ordinal ()I  java/lang/NoSuchFieldError	     YEARLY  java/lang/Object <clinit> ()V Code LineNumberTable LocalVariableTable 
StackMapTable 
SourceFile ScheduleController.java EnclosingMethod & :pl/gabgal/submanager/backend/controller/ScheduleController NestHost InnerClasses                   j     ( 
   
 O K   O K  	     # &          I        !    W  M    "    # $    %   '    % (   
      
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/controller/ScheduleController.class`

```
   A/	      :pl/gabgal/submanager/backend/controller/ScheduleController paymentRepository ;Lpl/gabgal/submanager/backend/repository/PaymentRepository;  	 
   9pl/gabgal/submanager/backend/repository/PaymentRepository findUnNotifiedPayments ()Ljava/util/List;  java/util/HashMap
 
    <init> ()V      java/util/List iterator ()Ljava/util/Iterator;      java/util/Iterator hasNext ()Z    ! " next ()Ljava/lang/Object; $ *pl/gabgal/submanager/backend/model/Payment	 & ' ( ) * )pl/gabgal/submanager/backend/enums/Notify NOTIFIED +Lpl/gabgal/submanager/backend/enums/Notify;
 # , - . setNotificationStatus .(Lpl/gabgal/submanager/backend/enums/Notify;)V  0 1 2 save &(Ljava/lang/Object;)Ljava/lang/Object;
 # 4 5 6 getSubscription 3()Lpl/gabgal/submanager/backend/model/Subscription;
 8 9 : ; < /pl/gabgal/submanager/backend/model/Subscription getUser +()Lpl/gabgal/submanager/backend/model/User;
 > ? @ A B 'pl/gabgal/submanager/backend/model/User getEmail ()Ljava/lang/String; D subscription_title
 8 F G B getTitle I J K L M 
java/util/Map put 8(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object; O subscription_price
 8 Q R S getPrice ()F
 U V W X Y java/lang/Float valueOf (F)Ljava/lang/Float; [ payment_date
 # ] ^ _ getDateOfPayment ()Ljava/util/Date; I a b 2 get  d e f add (Ljava/lang/Object;)Z   h i j apply ()Ljava/util/function/Function; I l m n computeIfAbsent C(Ljava/lang/Object;Ljava/util/function/Function;)Ljava/lang/Object;  p q r accept ](Lpl/gabgal/submanager/backend/controller/ScheduleController;)Ljava/util/function/BiConsumer; I t u v forEach "(Ljava/util/function/BiConsumer;)V  x y  findUnprocessedPayments	 { | } ~  )pl/gabgal/submanager/backend/enums/Status PAID +Lpl/gabgal/submanager/backend/enums/Status;
 #    	setStatus .(Lpl/gabgal/submanager/backend/enums/Status;)V  
java/sql/Date
     toLocalDate ()Ljava/time/LocalDate;	      <pl/gabgal/submanager/backend/controller/ScheduleController$1 3$SwitchMap$pl$gabgal$submanager$backend$enums$Cycle [I
 8    getCycle ,()Lpl/gabgal/submanager/backend/enums/Cycle;
      (pl/gabgal/submanager/backend/enums/Cycle ordinal ()I
      java/time/LocalDate 
plusMonths (J)Ljava/time/LocalDate;
     	plusYears  "java/lang/IllegalArgumentException
    X  java/lang/String &(Ljava/lang/Object;)Ljava/lang/String;     makeConcatWithConstants &(Ljava/lang/String;)Ljava/lang/String;
     (Ljava/lang/String;)V
   X  &(Ljava/time/LocalDate;)Ljava/sql/Date;
 # 
 #    setSubscription 4(Lpl/gabgal/submanager/backend/model/Subscription;)V
 #    setDateOfPayment (Ljava/util/Date;)V	 {    UNPROCESSED	 &   * 
UNNOTIFIED
    java/lang/Object	     emailService 3Lpl/gabgal/submanager/backend/service/EmailService;	     paymentService 5Lpl/gabgal/submanager/backend/service/PaymentService;
      1pl/gabgal/submanager/backend/service/EmailService 	sendEmail %(Ljava/lang/String;Ljava/util/List;)V  jakarta/mail/MessagingException  java/lang/RuntimeException
     (Ljava/lang/Throwable;)V  java/util/ArrayList
   notifyUsers Code LineNumberTable LocalVariableTable 	userEmail Ljava/lang/String; paymentInfo Ljava/util/Map; payment ,Lpl/gabgal/submanager/backend/model/Payment; this <Lpl/gabgal/submanager/backend/controller/ScheduleController; payments Ljava/util/List; userNotifications LocalVariableTypeTable 5Ljava/util/Map<Ljava/lang/String;Ljava/lang/Object;>; >Ljava/util/List<Lpl/gabgal/submanager/backend/model/Payment;>; jLjava/util/Map<Ljava/lang/String;Ljava/util/List<Ljava/util/Map<Ljava/lang/String;Ljava/lang/Object;>;>;>; 
StackMapTable RuntimeVisibleAnnotations 5Lorg/springframework/scheduling/annotation/Scheduled; 	fixedRate      : handleUnprocessedPayments sqlDate Ljava/sql/Date; currentPaymentDate Ljava/time/LocalDate; nextPaymentDate nextDateAsSqlDate 
newPayment (Lpl/gabgal/submanager/backend/repository/PaymentRepository;Lpl/gabgal/submanager/backend/service/EmailService;Lpl/gabgal/submanager/backend/service/PaymentService;)V MethodParameters RuntimeInvisibleAnnotations Llombok/Generated; lambda$notifyUsers$1 e !Ljakarta/mail/MessagingException; list lambda$notifyUsers$0 $(Ljava/lang/String;)Ljava/util/List; k 
SourceFile ScheduleController.java +Lorg/springframework/stereotype/Controller; NestMembers BootstrapMethods 2
  '(Ljava/lang/Object;Ljava/lang/Object;)V
    Unsupported Cycle: 
 !" "java/lang/invoke/LambdaMetafactory metafactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invoke/MethodType;)Ljava/lang/invoke/CallSite;$
%&' ( $java/lang/invoke/StringConcatFactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/invoke/CallSite; InnerClasses+ %java/lang/invoke/MethodHandles$Lookup- java/lang/invoke/MethodHandles Lookup !                                 *   L 
Y M+  N-   -   #: % +*  / W 3 7 =: 
Y :C 3 E H WN 3 P T H WZ \ H W, `  , `   c W , g   k   c WS,* o   s        B     
    " - # 5 $ A & N ( W ) i * ~ +  -  .  0  2  5  <    >  N x    W o    -            
                W o    
                  I   #  I          J          	   *  w L+  M,   ,   #N- z * - / W- \ : : - 3  .      .               %
  #
   Y- 3      : : #Y :- 3      +*  / W:       N    @ 
 B $ C + D 6 F ? G F I p J y K  L  O  Q  R  S  T  U  V  W  X    R  ?     F      <     5     ,    $            
          
        *     ^ #  V  @             J         \     * *+ *, *- ʱ               *                              
                       * +, Χ 
N Y- ؿ    	           7 	 :  8 
 9  ;    *  
 	                        L 	
     2      Y ݰ           0        	    
          
           # )         *,. 
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/controller/SubscriptionController.class`

```
   A r	      >pl/gabgal/submanager/backend/controller/SubscriptionController subscriptionService :Lpl/gabgal/submanager/backend/service/SubscriptionService;
  	 
   8pl/gabgal/submanager/backend/service/SubscriptionService createSubscription u(Lpl/gabgal/submanager/backend/dto/SubscriptionCreateRequest;)Lpl/gabgal/submanager/backend/dto/SubscriptionResponse;	      #org/springframework/http/HttpStatus CREATED %Lorg/springframework/http/HttpStatus;
      'org/springframework/http/ResponseEntity status `(Lorg/springframework/http/HttpStatusCode;)Lorg/springframework/http/ResponseEntity$BodyBuilder;      3org/springframework/http/ResponseEntity$BodyBuilder body =(Ljava/lang/Object;)Lorg/springframework/http/ResponseEntity;
    ! " getAllSubscriptions ()Ljava/util/List;	  $ %  OK
 ' ( ) * + java/lang/Long 	longValue ()J
  - . / getSubscriptionById :(J)Lpl/gabgal/submanager/backend/dto/SubscriptionResponse;
  1 2 3 deleteSubscription (Ljava/lang/Long;)V
  5 6 7 	noContent :()Lorg/springframework/http/ResponseEntity$HeadersBuilder; 9 : ; < = 6org/springframework/http/ResponseEntity$HeadersBuilder build +()Lorg/springframework/http/ResponseEntity;
 ? @ A B C java/lang/Object <init> ()V addSubscription g(Lpl/gabgal/submanager/backend/dto/SubscriptionCreateRequest;)Lorg/springframework/http/ResponseEntity; Code LineNumberTable LocalVariableTable this @Lpl/gabgal/submanager/backend/controller/SubscriptionController; subscription <Lpl/gabgal/submanager/backend/dto/SubscriptionCreateRequest; subs 7Lpl/gabgal/submanager/backend/dto/SubscriptionResponse; MethodParameters 	Signature (Lpl/gabgal/submanager/backend/dto/SubscriptionCreateRequest;)Lorg/springframework/http/ResponseEntity<Lpl/gabgal/submanager/backend/dto/SubscriptionResponse;>; RuntimeVisibleAnnotations 5Lorg/springframework/web/bind/annotation/PostMapping; RuntimeVisibleTypeAnnotations Ljakarta/validation/Valid; "RuntimeVisibleParameterAnnotations 5Lorg/springframework/web/bind/annotation/RequestBody; getAllUserSubscriptions Ljava/util/List; LocalVariableTypeTable ILjava/util/List<Lpl/gabgal/submanager/backend/dto/SubscriptionResponse;>; v()Lorg/springframework/http/ResponseEntity<Ljava/util/List<Lpl/gabgal/submanager/backend/dto/SubscriptionResponse;>;>; 4Lorg/springframework/web/bind/annotation/GetMapping; ;(Ljava/lang/Long;)Lorg/springframework/http/ResponseEntity; id Ljava/lang/Long; t(Ljava/lang/Long;)Lorg/springframework/http/ResponseEntity<Lpl/gabgal/submanager/backend/dto/SubscriptionResponse;>; 8Lorg/springframework/web/bind/annotation/RequestMapping; value /{id} 6Lorg/springframework/web/bind/annotation/PathVariable; M(Ljava/lang/Long;)Lorg/springframework/http/ResponseEntity<Ljava/lang/Void;>; 7Lorg/springframework/web/bind/annotation/DeleteMapping; =(Lpl/gabgal/submanager/backend/service/SubscriptionService;)V RuntimeInvisibleAnnotations Llombok/Generated; 
SourceFile SubscriptionController.java 8Lorg/springframework/web/bind/annotation/RestController; /api/subscription InnerClasses BodyBuilder HeadersBuilder !  ?           D E  F   X     * + M 
 ,      G   
     	  H         I J      K L  	 
 M N  O    K   P    Q R     S   T   	    U   V     U   W    X =  F   _     *  L # +      G   
       H        I J    
 M Y  Z      
 M [  P    \ R     ]    . ^  F   [     * + & ,M # ,      G   
    $  % H         I J      _ `   
 M N  O    _   P    a R     ]   b  c[ s d V     e    2 ^  F   I     * + 0 4 8     G   
    *  + H        I J      _ `  O    _   P    f R     g  c[ s d V     e    B h  F   >     
* >*+     G        H       
 I J     
    O      i     j    k    l R     m   b  c[ s n o       p	 9  q	
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/controller/TestController.class`

```
   A 
      java/lang/Object <init> ()V  
Hello, World! 
 6pl/gabgal/submanager/backend/controller/TestController Code LineNumberTable LocalVariableTable this 8Lpl/gabgal/submanager/backend/controller/TestController; hello ()Ljava/lang/String; RuntimeVisibleAnnotations 5Lorg/springframework/web/bind/annotation/CrossOrigin; origins * 4Lorg/springframework/web/bind/annotation/GetMapping; value / 
SourceFile TestController.java 8Lorg/springframework/web/bind/annotation/RestController; ! 	              /     *             
                   -                
 
                   [ s    [ s               
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/dto/AuthenticationResponse$AuthenticationResponseBuilder.class`

```
   A 9
      java/lang/Object <init> ()V	  	 
   Upl/gabgal/submanager/backend/dto/AuthenticationResponse$AuthenticationResponseBuilder authenticationToken Ljava/lang/String;	     refreshToken  7pl/gabgal/submanager/backend/dto/AuthenticationResponse
     '(Ljava/lang/String;Ljava/lang/String;)V      makeConcatWithConstants 8(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String; RuntimeInvisibleAnnotations Llombok/Generated; Code LineNumberTable LocalVariableTable this WLpl/gabgal/submanager/backend/dto/AuthenticationResponse$AuthenticationResponseBuilder; k(Ljava/lang/String;)Lpl/gabgal/submanager/backend/dto/AuthenticationResponse$AuthenticationResponseBuilder; MethodParameters build ;()Lpl/gabgal/submanager/backend/dto/AuthenticationResponse; toString ()Ljava/lang/String; 
SourceFile AuthenticationResponse.java NestHost BootstrapMethods + [AuthenticationResponse.AuthenticationResponseBuilder(authenticationToken=, refreshToken=) -
 . / 0  1 $java/lang/invoke/StringConcatFactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/invoke/CallSite; InnerClasses AuthenticationResponseBuilder 5 %java/lang/invoke/MethodHandles$Lookup 7 java/lang/invoke/MethodHandles Lookup !                                       /     *            	                             ;     *+ *           	                   !                      ;     *+ 
*           	                   !               " #     :      Y* * 
            	                      $ %     8     * * 
              	                      &    '         (     )     ,  * 2       3 	 4 6 8 
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/dto/AuthenticationResponse.class`

```
   A X  Upl/gabgal/submanager/backend/dto/AuthenticationResponse$AuthenticationResponseBuilder
     <init> ()V	  	 
   7pl/gabgal/submanager/backend/dto/AuthenticationResponse authenticationToken Ljava/lang/String;	     refreshToken
     canEqual (Ljava/lang/Object;)Z
     getAuthenticationToken ()Ljava/lang/String;
      java/lang/Object equals
     getRefreshToken
  ! " # hashCode ()I   % & ' makeConcatWithConstants 8(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
   builder Y()Lpl/gabgal/submanager/backend/dto/AuthenticationResponse$AuthenticationResponseBuilder; Code LineNumberTable RuntimeInvisibleAnnotations Llombok/Generated; LocalVariableTable this 9Lpl/gabgal/submanager/backend/dto/AuthenticationResponse; setAuthenticationToken (Ljava/lang/String;)V MethodParameters setRefreshToken o Ljava/lang/Object; other this$authenticationToken other$authenticationToken this$refreshToken other$refreshToken 
StackMapTable PRIME I result $authenticationToken 
$refreshToken toString '(Ljava/lang/String;Ljava/lang/String;)V 
SourceFile AuthenticationResponse.java NestMembers BootstrapMethods J =AuthenticationResponse(authenticationToken=, refreshToken=) L
 M N O & P $java/lang/invoke/StringConcatFactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/invoke/CallSite; InnerClasses AuthenticationResponseBuilder T %java/lang/invoke/MethodHandles$Lookup V java/lang/invoke/MethodHandles Lookup !                 	 ) *  +           Y     ,       	 -     .       +   /     *     ,       
 /        0 1   -     .       +   /     * 
    ,        /        0 1   -     .    2 3  +   :     *+     ,        /        0 1         4      -     .    5 3  +   :     *+ 
    ,        /        0 1         4      -     .       +        h+* +  + M,*  * N, :-   -  * :, :   
      ,        /   H    h 0 1     h 6 7   S 8 1  $ D 9 7  * > : 7  G ! ; 7  M  < 7  =     	        	 4    6  -     .       +   9     +     ,        /        0 1      8 7  4    8  -     .    " #  +        :;<=* N;h- + -  `=* :;h +   `=    ,        /   4    : 0 1    7 > ?   5 @ ?  
 0 A 7  #  B 7  =   J                        -     .    C   +   8     * *  $      ,        /        0 1   -     .     D  +   M     * (*+ *, 
    ,       
 /         0 1               4   	     -     .       +   /     * (    ,        /        0 1   -     .    E    F G      H     K  I Q       R 	 S U W 
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/dto/ErrorResponse.class`

```
   A !
      java/lang/Object <init> ()V	  	 
   .pl/gabgal/submanager/backend/dto/ErrorResponse code Ljava/lang/String;	     message '(Ljava/lang/String;Ljava/lang/String;)V Code LineNumberTable LocalVariableTable this 0Lpl/gabgal/submanager/backend/dto/ErrorResponse; MethodParameters RuntimeInvisibleAnnotations Llombok/Generated; getCode ()Ljava/lang/String; 
getMessage setCode (Ljava/lang/String;)V 
setMessage 
SourceFile ErrorResponse.java !                        M     * *+ *, 
                                        	                    /     *            
                            /     * 
                                       :     *+            
                                        :     *+ 
           
                                       
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/dto/LoginRequest.class`

```
   A D
      java/lang/Record <init> ()V	  	 
   -pl/gabgal/submanager/backend/dto/LoginRequest username Ljava/lang/String;	     password      toString C(Lpl/gabgal/submanager/backend/dto/LoginRequest;)Ljava/lang/String;      hashCode 2(Lpl/gabgal/submanager/backend/dto/LoginRequest;)I      equals D(Lpl/gabgal/submanager/backend/dto/LoginRequest;Ljava/lang/Object;)Z RuntimeVisibleAnnotations )Ljakarta/validation/constraints/NotBlank; message Username cannot be empty. RuntimeVisibleTypeAnnotations Password cannot be empty. '(Ljava/lang/String;Ljava/lang/String;)V Code LineNumberTable LocalVariableTable this /Lpl/gabgal/submanager/backend/dto/LoginRequest; MethodParameters "RuntimeVisibleParameterAnnotations ()Ljava/lang/String; ()I (Ljava/lang/Object;)Z o Ljava/lang/Object; 
SourceFile LoginRequest.java Record BootstrapMethods 4 username;password  
 8
 9 : ; < = java/lang/runtime/ObjectMethods 	bootstrap (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/TypeDescriptor;Ljava/lang/Class;Ljava/lang/String;[Ljava/lang/invoke/MethodHandle;)Ljava/lang/Object; InnerClasses @ %java/lang/invoke/MethodHandles$Lookup B java/lang/invoke/MethodHandles Lookup 1                 s      
     s             s !     
     s !    "  #   M     * *+ *, 
    $        %         & '               (   	                 s     s ! )       s     s !   *  #   1     *       $        %        & '     +  #   1     *       $        %        & '     ,  #   <     *+       $        %        & '      - .  (    -     *  #   /     *     $        %        & '          s      
     s    *  #   /     * 
    $        %        & '          s !     
     s !  /    0 1   4         
     s         
     s ! 2     7   3 5 6 >   
  ? A C 
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/dto/PaymentResponse.class`

```
   A J
      java/lang/Record <init> ()V	  	 
   0pl/gabgal/submanager/backend/dto/PaymentResponse 	paymentId J	     status +Lpl/gabgal/submanager/backend/enums/Status;	     
dateOfPayment Ljava/util/Date;	     subscriptionId      toString F(Lpl/gabgal/submanager/backend/dto/PaymentResponse;)Ljava/lang/String;      hashCode 5(Lpl/gabgal/submanager/backend/dto/PaymentResponse;)I   ! " # equals G(Lpl/gabgal/submanager/backend/dto/PaymentResponse;Ljava/lang/Object;)Z @(JLpl/gabgal/submanager/backend/enums/Status;Ljava/util/Date;J)V Code LineNumberTable LocalVariableTable this 2Lpl/gabgal/submanager/backend/dto/PaymentResponse; MethodParameters ()Ljava/lang/String; ()I (Ljava/lang/Object;)Z o Ljava/lang/Object; ()J -()Lpl/gabgal/submanager/backend/enums/Status; ()Ljava/util/Date; 
SourceFile PaymentResponse.java Record BootstrapMethods 8 -paymentId;status;dateOfPayment;subscriptionId  
   >
 ? @ A B C java/lang/runtime/ObjectMethods 	bootstrap (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/TypeDescriptor;Ljava/lang/Class;Ljava/lang/String;[Ljava/lang/invoke/MethodHandle;)Ljava/lang/Object; InnerClasses F %java/lang/invoke/MethodHandles$Lookup H java/lang/invoke/MethodHandles Lookup 1                             $  %   m     * * *- 
* *     &        '   4     ( )                           *                  +  %   1     *       &        '        ( )     ,  %   1     *       &        '        ( )    " -  %   <     *+        &        '        ( )      . /  *    .     0  %   /     *     &        '        ( )     1  %   /     * 
    &        '        ( )     2  %   /     *     &        '        ( )     0  %   /     *     &        '        ( )    3    4 5                     6     =   7 9 : ; < D   
  E G I 
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/dto/RegisterRequest.class`

```
   A S
      java/lang/Record <init> ()V	  	 
   0pl/gabgal/submanager/backend/dto/RegisterRequest username Ljava/lang/String;	     email	     password      toString F(Lpl/gabgal/submanager/backend/dto/RegisterRequest;)Ljava/lang/String;      hashCode 5(Lpl/gabgal/submanager/backend/dto/RegisterRequest;)I      equals G(Lpl/gabgal/submanager/backend/dto/RegisterRequest;Ljava/lang/Object;)Z RuntimeVisibleAnnotations )Ljakarta/validation/constraints/NotBlank; message Username cannot be empty. %Ljakarta/validation/constraints/Size; min    max    ,The username should be 3-20 characters long. RuntimeVisibleTypeAnnotations E-mail cannot be empty. &Ljakarta/validation/constraints/Email; Provided e-mail is not valid. Password cannot be empty.    .Password should be at least 6 characters long. 9(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V Code LineNumberTable LocalVariableTable this 2Lpl/gabgal/submanager/backend/dto/RegisterRequest; MethodParameters "RuntimeVisibleParameterAnnotations ()Ljava/lang/String; ()I (Ljava/lang/Object;)Z o Ljava/lang/Object; 
SourceFile RegisterRequest.java Record BootstrapMethods B username;email;password  
  G
 H I J K L java/lang/runtime/ObjectMethods 	bootstrap (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/TypeDescriptor;Ljava/lang/Class;Ljava/lang/String;[Ljava/lang/invoke/MethodHandle;)Ljava/lang/Object; InnerClasses O %java/lang/invoke/MethodHandles$Lookup Q java/lang/invoke/MethodHandles Lookup 1                  !s " #  $I % &I ' !s ( )   "      !s "  #  $I % &I ' !s (             !s * +  !s , )         !s *  +  !s ,             !s - #  $I . !s / )         !s -  #  $I . !s /    0  1   \     * *+ *, 
*-     2        3   *     4 5                     6   
          )   Y       !s "   #  $I % &I ' !s (     !s *  +  !s ,     !s -  #  $I . !s / 7   L     !s " #  $I % &I ' !s (     !s * +  !s ,     !s - #  $I . !s /   8  1   1     *       2        3        4 5     9  1   1     *       2        3        4 5     :  1   <     *+       2        3        4 5      ; <  6    ;     8  1   /     *     2        3        4 5           !s " #  $I % &I ' !s ( )   "      !s "  #  $I % &I ' !s (   8  1   /     * 
    2        3        4 5           !s * +  !s , )         !s *  +  !s ,   8  1   /     *     2        3        4 5           !s - #  $I . !s / )         !s -  #  $I . !s /  =    > ?   }     )   "      !s "  #  $I % &I ' !s (    )         !s *  +  !s ,    )         !s -  #  $I . !s / @     F   A C D E M   
  N P R 
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/dto/SubscriptionCreateRequest.class`

```
   A i
      java/lang/Record <init> ()V	  	 
   :pl/gabgal/submanager/backend/dto/SubscriptionCreateRequest title Ljava/lang/String;	     description	     price F	     cycle *Lpl/gabgal/submanager/backend/enums/Cycle;	     dateOfLastPayment Ljava/util/Date;	     
currencyId J   ! " # toString P(Lpl/gabgal/submanager/backend/dto/SubscriptionCreateRequest;)Ljava/lang/String;   % & ' hashCode ?(Lpl/gabgal/submanager/backend/dto/SubscriptionCreateRequest;)I   ) * + equals Q(Lpl/gabgal/submanager/backend/dto/SubscriptionCreateRequest;Ljava/lang/Object;)Z RuntimeVisibleAnnotations )Ljakarta/validation/constraints/NotBlank; message Title cannot be blank %Ljakarta/validation/constraints/Size; max   K #Title must be at most 75 characters RuntimeVisibleTypeAnnotations    *Description must be at most 255 characters (Ljakarta/validation/constraints/NotNull; Price must be specified )Ljakarta/validation/constraints/Positive; Price must be greater than zero  Date of last payment is required .Ljakarta/validation/constraints/PastOrPresent; ,Date of last payment cannot be in the future Currency ID must be valid c(Ljava/lang/String;Ljava/lang/String;FLpl/gabgal/submanager/backend/enums/Cycle;Ljava/util/Date;J)V Code LineNumberTable LocalVariableTable this <Lpl/gabgal/submanager/backend/dto/SubscriptionCreateRequest; MethodParameters "RuntimeVisibleParameterAnnotations ()Ljava/lang/String; ()I (Ljava/lang/Object;)Z o Ljava/lang/Object; ()F ,()Lpl/gabgal/submanager/backend/enums/Cycle; ()Ljava/util/Date; ()J 
SourceFile SubscriptionCreateRequest.java Record BootstrapMethods U :title;description;price;cycle;dateOfLastPayment;currencyId  
     ]
 ^ _ ` a b java/lang/runtime/ObjectMethods 	bootstrap (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/TypeDescriptor;Ljava/lang/Class;Ljava/lang/String;[Ljava/lang/invoke/MethodHandle;)Ljava/lang/Object; InnerClasses e %java/lang/invoke/MethodHandles$Lookup g java/lang/invoke/MethodHandles Lookup 1          ,     -  .s / 0  1I 2 .s 3 4      -  .s /  0  1I 2 .s 3     ,     0  1I 5 .s 6 4      0  1I 5 .s 6     ,     7  .s 8 9  .s : 4      7  .s 8  9  .s :          ,     7  .s ; <  .s = 4      7  .s ;  <  .s =     ,     9  .s > 4   
   9  .s > 
   ?  @        &* *+ *, 
*% * * *     A       	 B   H    & C D     &      &      &      &      &      &    E                      4   l    -  .s /   0  1I 2 .s 3  0  1I 5 .s 6  7  .s 8  9  .s :  7  .s ;  <  .s =  9  .s > F   _  -  .s / 0  1I 2 .s 3  0  1I 5 .s 6  7  .s 8 9  .s :    7  .s ; <  .s =  9  .s >  " G  @   1     *        A       	 B        C D    & H  @   1     * $      A       	 B        C D    * I  @   <     *+ (      A       	 B        C D      J K  E    J     G  @   /     *     A       	 B        C D   ,     -  .s / 0  1I 2 .s 3 4      -  .s /  0  1I 2 .s 3   G  @   /     * 
    A       	 B        C D   ,     0  1I 5 .s 6 4      0  1I 5 .s 6   L  @   /     *     A       	 B        C D   ,     7  .s 8 9  .s : 4      7  .s 8  9  .s :   M  @   /     *     A       	 B        C D     N  @   /     *     A       	 B        C D   ,     7  .s ; <  .s = 4      7  .s ;  <  .s =   O  @   /     *     A       	 B        C D   ,     9  .s > 4   
   9  .s >  P    Q R        4      -  .s /  0  1I 2 .s 3    4      0  1I 5 .s 6    4      7  .s 8  9  .s :        4      7  .s ;  <  .s =    4   
   9  .s > S     \   T V W X Y Z [ c   
  d f h 
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/dto/SubscriptionResponse.class`

```
   A Y
      java/lang/Record <init> ()V	  	 
   5pl/gabgal/submanager/backend/dto/SubscriptionResponse subscriptionId J	     title Ljava/lang/String;	     description	     price F	     cycle *Lpl/gabgal/submanager/backend/enums/Cycle;	     dateOfLastPayment Ljava/util/Date;	  ! "  
currencyId   $ % & toString K(Lpl/gabgal/submanager/backend/dto/SubscriptionResponse;)Ljava/lang/String;   ( ) * hashCode :(Lpl/gabgal/submanager/backend/dto/SubscriptionResponse;)I   , - . equals L(Lpl/gabgal/submanager/backend/dto/SubscriptionResponse;Ljava/lang/Object;)Z d(JLjava/lang/String;Ljava/lang/String;FLpl/gabgal/submanager/backend/enums/Cycle;Ljava/util/Date;J)V Code LineNumberTable LocalVariableTable this 7Lpl/gabgal/submanager/backend/dto/SubscriptionResponse; MethodParameters ()Ljava/lang/String; ()I (Ljava/lang/Object;)Z o Ljava/lang/Object; ()J ()F ,()Lpl/gabgal/submanager/backend/enums/Cycle; ()Ljava/util/Date; 
SourceFile SubscriptionResponse.java Record BootstrapMethods D IsubscriptionId;title;description;price;cycle;dateOfLastPayment;currencyId  
       M
 N O P Q R java/lang/runtime/ObjectMethods 	bootstrap (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/TypeDescriptor;Ljava/lang/Class;Ljava/lang/String;[Ljava/lang/invoke/MethodHandle;)Ljava/lang/Object; InnerClasses U %java/lang/invoke/MethodHandles$Lookup W java/lang/invoke/MethodHandles Lookup 1                                     "       /  0     
   -* * *- 
* * * * *      1        2   R    - 3 4     -      -      -      -      -      -      - "   5                      "    % 6  0   1     * #      1        2        3 4    ) 7  0   1     * '      1        2        3 4    - 8  0   <     *+ +      1        2        3 4      9 :  5    9     ;  0   /     *     1        2        3 4     6  0   /     * 
    1        2        3 4     6  0   /     *     1        2        3 4     <  0   /     *     1        2        3 4     =  0   /     *     1        2        3 4     >  0   /     *     1        2        3 4    " ;  0   /     *      1        2        3 4    ?    @ A   ,                          "    B     L 	  C E F G H I J K S   
  T V X 
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/enums/Cycle.class`

```
   A 5  (pl/gabgal/submanager/backend/enums/Cycle	     MONTHLY *Lpl/gabgal/submanager/backend/enums/Cycle;	   	  YEARLY	    
 $VALUES +[Lpl/gabgal/submanager/backend/enums/Cycle;
   
   clone ()Ljava/lang/Object;
      java/lang/Enum valueOf 5(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;
     <init> (Ljava/lang/String;I)V 
   	
  ! " # $values -()[Lpl/gabgal/submanager/backend/enums/Cycle; values Code LineNumberTable >(Ljava/lang/String;)Lpl/gabgal/submanager/backend/enums/Cycle; LocalVariableTable name Ljava/lang/String; MethodParameters this 
$enum$name 
$enum$ordinal 	Signature ()V <clinit> <Ljava/lang/Enum<Lpl/gabgal/submanager/backend/enums/Cycle;>; 
SourceFile 
Cycle.java@1     @    @ 	     
    	 $ #  %   "      
 
      &        	  '  %   4     
*      &        (       
 ) *   +    )      %   1     *+     &        (        ,    +   	 -  .  /    0
 " #  %   )       Y SY S    &         1 0  %   A      ! Y   Y     
    &        
     /    2 3    4
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/enums/Notify.class`

```
   A 5  )pl/gabgal/submanager/backend/enums/Notify	     
UNNOTIFIED +Lpl/gabgal/submanager/backend/enums/Notify;	   	  NOTIFIED	    
 $VALUES ,[Lpl/gabgal/submanager/backend/enums/Notify;
   
   clone ()Ljava/lang/Object;
      java/lang/Enum valueOf 5(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;
     <init> (Ljava/lang/String;I)V 
   	
  ! " # $values .()[Lpl/gabgal/submanager/backend/enums/Notify; values Code LineNumberTable ?(Ljava/lang/String;)Lpl/gabgal/submanager/backend/enums/Notify; LocalVariableTable name Ljava/lang/String; MethodParameters this 
$enum$name 
$enum$ordinal 	Signature ()V <clinit> =Ljava/lang/Enum<Lpl/gabgal/submanager/backend/enums/Notify;>; 
SourceFile Notify.java@1     @    @ 	     
    	 $ #  %   "      
 
      &        	  '  %   4     
*      &        (       
 ) *   +    )      %   1     *+     &        (        ,    +   	 -  .  /    0
 " #  %   )       Y SY S    &         1 0  %   A      ! Y   Y     
    &        
     /    2 3    4
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/enums/Role.class`

```
   A 5  'pl/gabgal/submanager/backend/enums/Role	     USER )Lpl/gabgal/submanager/backend/enums/Role;	   	  ADMIN	    
 $VALUES *[Lpl/gabgal/submanager/backend/enums/Role;
   
   clone ()Ljava/lang/Object;
      java/lang/Enum valueOf 5(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;
     <init> (Ljava/lang/String;I)V 
   	
  ! " # $values ,()[Lpl/gabgal/submanager/backend/enums/Role; values Code LineNumberTable =(Ljava/lang/String;)Lpl/gabgal/submanager/backend/enums/Role; LocalVariableTable name Ljava/lang/String; MethodParameters this 
$enum$name 
$enum$ordinal 	Signature ()V <clinit> ;Ljava/lang/Enum<Lpl/gabgal/submanager/backend/enums/Role;>; 
SourceFile 	Role.java@1     @    @ 	     
    	 $ #  %   "      
 
      &        	  '  %   4     
*      &        (       
 ) *   +    )      %   1     *+     &        (        ,    +   	 -  .  /    0
 " #  %   )       Y SY S    &         1 0  %   A      ! Y   Y     
    &        
     /    2 3    4
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/enums/Status.class`

```
   A 5  )pl/gabgal/submanager/backend/enums/Status	     UNPROCESSED +Lpl/gabgal/submanager/backend/enums/Status;	   	  PAID	    
 $VALUES ,[Lpl/gabgal/submanager/backend/enums/Status;
   
   clone ()Ljava/lang/Object;
      java/lang/Enum valueOf 5(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;
     <init> (Ljava/lang/String;I)V 
   	
  ! " # $values .()[Lpl/gabgal/submanager/backend/enums/Status; values Code LineNumberTable ?(Ljava/lang/String;)Lpl/gabgal/submanager/backend/enums/Status; LocalVariableTable name Ljava/lang/String; MethodParameters this 
$enum$name 
$enum$ordinal 	Signature ()V <clinit> =Ljava/lang/Enum<Lpl/gabgal/submanager/backend/enums/Status;>; 
SourceFile Status.java@1     @    @ 	     
    	 $ #  %   "      
 
      &        	  '  %   4     
*      &        (       
 ) *   +    )      %   1     *+     &        (        ,    +   	 -  .  /    0
 " #  %   )       Y SY S    &         1 0  %   A      ! Y   Y     
    &        
     /    2 3    4
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/model/Currency$CurrencyBuilder.class`

```
   A A
      java/lang/Object <init> ()V	  	 
   ;pl/gabgal/submanager/backend/model/Currency$CurrencyBuilder 
currencyId Ljava/lang/Long;	     name Ljava/lang/String;	     	shortName	     sign  +pl/gabgal/submanager/backend/model/Currency
     I(Ljava/lang/Long;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V      makeConcatWithConstants Z(Ljava/lang/Long;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String; RuntimeInvisibleAnnotations Llombok/Generated; Code LineNumberTable LocalVariableTable this =Lpl/gabgal/submanager/backend/model/Currency$CurrencyBuilder; O(Ljava/lang/Long;)Lpl/gabgal/submanager/backend/model/Currency$CurrencyBuilder; MethodParameters Q(Ljava/lang/String;)Lpl/gabgal/submanager/backend/model/Currency$CurrencyBuilder; build /()Lpl/gabgal/submanager/backend/model/Currency; toString ()Ljava/lang/String; 
SourceFile 
Currency.java NestHost BootstrapMethods 3 CCurrency.CurrencyBuilder(currencyId=, name=, shortName=, sign=) 5
 6 7 8  9 $java/lang/invoke/StringConcatFactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/invoke/CallSite; InnerClasses CurrencyBuilder = %java/lang/invoke/MethodHandles$Lookup ? java/lang/invoke/MethodHandles Lookup !                !             !             !             !         "   /     *     #        $        % &         !     '  "   ;     *+ *    #        $        % &         (            !     )  "   ;     *+ 
*    #        $        % &         (            !     )  "   ;     *+ *    #        $        % &         (            !     )  "   ;     *+ *    #        $        % &         (            !    * +  "   B      Y* * 
* *      #        $        % &         !    , -  "   @     * * 
* *        #        $        % &         !    .    /       !   0     1     4  2 :       ; 	 < > @ 
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/model/Currency.class`

```
   A F  ;pl/gabgal/submanager/backend/model/Currency$CurrencyBuilder
     <init> ()V	  	 
   +pl/gabgal/submanager/backend/model/Currency 
currencyId Ljava/lang/Long;	     name Ljava/lang/String;	     	shortName	     sign
    java/lang/Object RuntimeVisibleAnnotations Ljakarta/persistence/Id; $Ljakarta/persistence/GeneratedValue; strategy $Ljakarta/persistence/GenerationType; IDENTITY Ljakarta/persistence/Column; currency_id nullable     unique    
short_name builder ?()Lpl/gabgal/submanager/backend/model/Currency$CurrencyBuilder; Code LineNumberTable RuntimeInvisibleAnnotations Llombok/Generated; 
getCurrencyId ()Ljava/lang/Long; LocalVariableTable this -Lpl/gabgal/submanager/backend/model/Currency; getName ()Ljava/lang/String; getShortName getSign 
setCurrencyId (Ljava/lang/Long;)V MethodParameters setName (Ljava/lang/String;)V setShortName setSign I(Ljava/lang/Long;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V 
SourceFile 
Currency.java Ljakarta/persistence/Entity; Ljakarta/persistence/Table; currency NestMembers InnerClasses CurrencyBuilder !                    e      s !             s  "Z # $Z %             s & "Z # $Z %             "Z #  	 ' (  )           Y     *        +     ,    - .  )   /     *     *        /        0 1   +     ,    2 3  )   /     * 
    *        /        0 1   +     ,    4 3  )   /     *     *        /        0 1   +     ,    5 3  )   /     *     *        /        0 1   +     ,    6 7  )   :     *+     *        /        0 1         8      +     ,    9 :  )   :     *+ 
    *        /        0 1         8      +     ,    ; :  )   :     *+     *        /        0 1         8      +     ,    < :  )   :     *+     *        /        0 1         8      +     ,       )   /     *     *        /        0 1   +     ,     =  )   l     * *+ *, 
*- *     *       
 /   4     0 1                           8            +     ,    >    ?      @   A  s B C      D   
    E 	
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/model/Payment$PaymentBuilder.class`

```
   A P
      java/lang/Object <init> ()V	  	 
   9pl/gabgal/submanager/backend/model/Payment$PaymentBuilder 	paymentId J	     status +Lpl/gabgal/submanager/backend/enums/Status;	     notificationStatus +Lpl/gabgal/submanager/backend/enums/Notify;	     
dateOfPayment Ljava/util/Date;	     subscription 1Lpl/gabgal/submanager/backend/model/Subscription;  *pl/gabgal/submanager/backend/model/Payment
     ! (JLpl/gabgal/submanager/backend/enums/Status;Lpl/gabgal/submanager/backend/enums/Notify;Ljava/util/Date;Lpl/gabgal/submanager/backend/model/Subscription;)V
 # $ % & ' java/lang/String valueOf &(Ljava/lang/Object;)Ljava/lang/String;   ) * + makeConcatWithConstants ](JLjava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String; RuntimeInvisibleAnnotations Llombok/Generated; Code LineNumberTable LocalVariableTable this ;Lpl/gabgal/submanager/backend/model/Payment$PaymentBuilder; >(J)Lpl/gabgal/submanager/backend/model/Payment$PaymentBuilder; MethodParameters h(Lpl/gabgal/submanager/backend/enums/Status;)Lpl/gabgal/submanager/backend/model/Payment$PaymentBuilder; h(Lpl/gabgal/submanager/backend/enums/Notify;)Lpl/gabgal/submanager/backend/model/Payment$PaymentBuilder; M(Ljava/util/Date;)Lpl/gabgal/submanager/backend/model/Payment$PaymentBuilder; n(Lpl/gabgal/submanager/backend/model/Subscription;)Lpl/gabgal/submanager/backend/model/Payment$PaymentBuilder; build .()Lpl/gabgal/submanager/backend/model/Payment; toString ()Ljava/lang/String; 
SourceFile Payment.java NestHost BootstrapMethods B dPayment.PaymentBuilder(paymentId=, status=, notificationStatus=, dateOfPayment=, subscription=) D
 E F G * H $java/lang/invoke/StringConcatFactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/invoke/CallSite; InnerClasses PaymentBuilder L %java/lang/invoke/MethodHandles$Lookup N java/lang/invoke/MethodHandles Lookup !          ,     -       ,     -       ,     -       ,     -       ,     -         .   /     *     /        0        1 2   ,     -     3  .   ;     * *    /        0        1 2         4      ,     -     5  .   ;     *+ 
*    /        0        1 2         4      ,     -     6  .   ;     *+ *    /        0        1 2         4      ,     -     7  .   ;     *+ *    /        0        1 2         4      ,     -     8  .   ;     *+ *    /        0        1 2         4      ,     -    9 :  .   F      Y* * 
* * *      /        0        1 2   ,     -    ; <  .   P     &* * 
 "*  "*  "*  " (      /        0       & 1 2   ,     -    =    > ,     -   ?     @     C  A I       J 	 K M O 
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/model/Payment.class`

```
   A j  9pl/gabgal/submanager/backend/model/Payment$PaymentBuilder
     <init> ()V	  	 
   *pl/gabgal/submanager/backend/model/Payment 	paymentId J	     status +Lpl/gabgal/submanager/backend/enums/Status;	     notificationStatus +Lpl/gabgal/submanager/backend/enums/Notify;	     
dateOfPayment Ljava/util/Date;	     subscription 1Lpl/gabgal/submanager/backend/model/Subscription;
    java/lang/Object	 ! " # $  )pl/gabgal/submanager/backend/enums/Status UNPROCESSED	 & ' ( )  )pl/gabgal/submanager/backend/enums/Notify NOTIFIED RuntimeVisibleAnnotations Ljakarta/persistence/Id; $Ljakarta/persistence/GeneratedValue; strategy $Ljakarta/persistence/GenerationType; IDENTITY Ljakarta/persistence/Column; name 
payment_id unique    nullable      Ljakarta/persistence/Enumerated; value Ljakarta/persistence/EnumType; STRING notifiaction_status Ljakarta/persistence/Temporal; "Ljakarta/persistence/TemporalType; DATE date_of_payment Ljakarta/persistence/ManyToOne;  Ljakarta/persistence/JoinColumn; subscription_id builder =()Lpl/gabgal/submanager/backend/model/Payment$PaymentBuilder; Code LineNumberTable RuntimeInvisibleAnnotations Llombok/Generated; getPaymentId ()J LocalVariableTable this ,Lpl/gabgal/submanager/backend/model/Payment; 	getStatus -()Lpl/gabgal/submanager/backend/enums/Status; getNotificationStatus -()Lpl/gabgal/submanager/backend/enums/Notify; getDateOfPayment ()Ljava/util/Date; getSubscription 3()Lpl/gabgal/submanager/backend/model/Subscription; setPaymentId (J)V MethodParameters 	setStatus .(Lpl/gabgal/submanager/backend/enums/Status;)V setNotificationStatus .(Lpl/gabgal/submanager/backend/enums/Notify;)V setDateOfPayment (Ljava/util/Date;)V setSubscription 4(Lpl/gabgal/submanager/backend/model/Subscription;)V (JLpl/gabgal/submanager/backend/enums/Status;Lpl/gabgal/submanager/backend/enums/Notify;Ljava/util/Date;Lpl/gabgal/submanager/backend/model/Subscription;)V 
SourceFile Payment.java Ljakarta/persistence/Entity; Ljakarta/persistence/Table; payment NestMembers InnerClasses PaymentBuilder !          *   $  +   ,  -e . / 0  1s 2 3Z 4 5Z 6     *     7  8e 9 : 0  5Z 6     *     7  8e 9 : 0  1s ; 5Z 6     *     <  8e = > 0  1s ? 5Z 6     *     @   A  1s B 5Z 6 
 	 C D  E           Y     F        G     H    I J  E   /     *     F        K        L M   G     H    N O  E   /     * 
    F        K        L M   G     H    P Q  E   /     *     F        K        L M   G     H    R S  E   /     *     F       " K        L M   G     H    T U  E   /     *     F       & K        L M   G     H    V W  E   :     *     F       
 K        L M         X      G     H    Y Z  E   :     *+ 
    F       
 K        L M         X      G     H    [ \  E   :     *+     F       
 K        L M         X      G     H    ] ^  E   :     *+     F       
 K        L M         X      G     H    _ `  E   :     *+     F       
 K        L M         X      G     H       E   E     * *   
* %     F            K        L M   G     H     a  E        /* *   
* % * *- 
* * *     F              K   >    / L M     /      /      /      /      /    X              G     H    b    c *     d   e  1s f g      h   
    i 	
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/model/Subscription$SubscriptionBuilder.class`

```
   A f
      java/lang/Object <init> ()V	  	 
   Cpl/gabgal/submanager/backend/model/Subscription$SubscriptionBuilder subscriptionId J	     title Ljava/lang/String;	     description	     price F	     cycle *Lpl/gabgal/submanager/backend/enums/Cycle;	     dateOfLastPayment Ljava/util/Date;	  ! " # user )Lpl/gabgal/submanager/backend/model/User;	  % & ' currency -Lpl/gabgal/submanager/backend/model/Currency;	  ) * + payments Ljava/util/List; - /pl/gabgal/submanager/backend/model/Subscription
 , /  0 (JLjava/lang/String;Ljava/lang/String;FLpl/gabgal/submanager/backend/enums/Cycle;Ljava/util/Date;Lpl/gabgal/submanager/backend/model/User;Lpl/gabgal/submanager/backend/model/Currency;Ljava/util/List;)V
 2 3 4 5 6 java/lang/String valueOf &(Ljava/lang/Object;)Ljava/lang/String;   8 9 : makeConcatWithConstants (JLjava/lang/String;Ljava/lang/String;FLjava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String; RuntimeInvisibleAnnotations Llombok/Generated; 	Signature >Ljava/util/List<Lpl/gabgal/submanager/backend/model/Payment;>; Code LineNumberTable LocalVariableTable this ELpl/gabgal/submanager/backend/model/Subscription$SubscriptionBuilder; H(J)Lpl/gabgal/submanager/backend/model/Subscription$SubscriptionBuilder; MethodParameters Y(Ljava/lang/String;)Lpl/gabgal/submanager/backend/model/Subscription$SubscriptionBuilder; H(F)Lpl/gabgal/submanager/backend/model/Subscription$SubscriptionBuilder; q(Lpl/gabgal/submanager/backend/enums/Cycle;)Lpl/gabgal/submanager/backend/model/Subscription$SubscriptionBuilder; W(Ljava/util/Date;)Lpl/gabgal/submanager/backend/model/Subscription$SubscriptionBuilder; p(Lpl/gabgal/submanager/backend/model/User;)Lpl/gabgal/submanager/backend/model/Subscription$SubscriptionBuilder; t(Lpl/gabgal/submanager/backend/model/Currency;)Lpl/gabgal/submanager/backend/model/Subscription$SubscriptionBuilder; W(Ljava/util/List;)Lpl/gabgal/submanager/backend/model/Subscription$SubscriptionBuilder; LocalVariableTypeTable (Ljava/util/List<Lpl/gabgal/submanager/backend/model/Payment;>;)Lpl/gabgal/submanager/backend/model/Subscription$SubscriptionBuilder; build 3()Lpl/gabgal/submanager/backend/model/Subscription; toString ()Ljava/lang/String; 
SourceFile Subscription.java NestHost BootstrapMethods X Subscription.SubscriptionBuilder(subscriptionId=, title=, description=, price=, cycle=, dateOfLastPayment=, user=, currency=, payments=) Z
 [ \ ] 9 ^ $java/lang/invoke/StringConcatFactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/invoke/CallSite; InnerClasses SubscriptionBuilder b %java/lang/invoke/MethodHandles$Lookup d java/lang/invoke/MethodHandles Lookup !     	     ;     <       ;     <       ;     <       ;     <       ;     <       ;     <    " #  ;     <    & '  ;     <    * +  =    > ;     <         ?   /     *     @        A        B C   ;     <     D  ?   ;     * *    @        A        B C         E      ;     <     F  ?   ;     *+ 
*    @        A        B C         E      ;     <     F  ?   ;     *+ *    @        A        B C         E      ;     <     G  ?   ;     *# *    @        A        B C         E      ;     <     H  ?   ;     *+ *    @        A        B C         E      ;     <     I  ?   ;     *+ *    @        A        B C         E      ;     <    " J  ?   ;     *+  *    @        A        B C      " #  E    "  ;     <    & K  ?   ;     *+ $*    @        A        B C      & '  E    &  ;     <    * L  ?   M     *+ (*    @        A        B C      * +  M        * >  E    *  =    N ;     <    O P  ?   V     , ,Y* * 
* * * * *  * $* ( .    @        A       , B C   ;     <    Q R  ?   c 
    9* * 
* * *  1*  1*   1* $ 1* ( 1 7      @        A       9 B C   ;     <    S    T ;     <   U    , V     Y  W _      , ` 	 a c e 
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/model/Subscription.class`

```
   A   Cpl/gabgal/submanager/backend/model/Subscription$SubscriptionBuilder
     <init> ()V	  	 
   /pl/gabgal/submanager/backend/model/Subscription subscriptionId J	     title Ljava/lang/String;	     description	     price F	     cycle *Lpl/gabgal/submanager/backend/enums/Cycle;	     dateOfLastPayment Ljava/util/Date;	  ! " # user )Lpl/gabgal/submanager/backend/model/User;	  % & ' currency -Lpl/gabgal/submanager/backend/model/Currency;	  ) * + payments Ljava/util/List;
 -  . java/lang/Object	 0 1 2 3  (pl/gabgal/submanager/backend/enums/Cycle MONTHLY 5 java/util/ArrayList
 4  RuntimeVisibleAnnotations Ljakarta/persistence/Id; $Ljakarta/persistence/GeneratedValue; strategy $Ljakarta/persistence/GenerationType; IDENTITY Ljakarta/persistence/Column; name subscription_id nullable      Ljakarta/persistence/Enumerated; value Ljakarta/persistence/EnumType; STRING Ljakarta/persistence/Temporal; "Ljakarta/persistence/TemporalType; DATE date_of_last_payment Ljakarta/persistence/ManyToOne;  Ljakarta/persistence/JoinColumn; user_id currency_id 	Signature >Ljava/util/List<Lpl/gabgal/submanager/backend/model/Payment;>; Ljakarta/persistence/OneToMany; mappedBy subscription cascade !Ljakarta/persistence/CascadeType; ALL 
orphanRemoval    builder G()Lpl/gabgal/submanager/backend/model/Subscription$SubscriptionBuilder; Code LineNumberTable RuntimeInvisibleAnnotations Llombok/Generated; getSubscriptionId ()J LocalVariableTable this 1Lpl/gabgal/submanager/backend/model/Subscription; getTitle ()Ljava/lang/String; getDescription getPrice ()F getCycle ,()Lpl/gabgal/submanager/backend/enums/Cycle; getDateOfLastPayment ()Ljava/util/Date; getUser +()Lpl/gabgal/submanager/backend/model/User; getCurrency /()Lpl/gabgal/submanager/backend/model/Currency; getPayments ()Ljava/util/List; @()Ljava/util/List<Lpl/gabgal/submanager/backend/model/Payment;>; setSubscriptionId (J)V MethodParameters setTitle (Ljava/lang/String;)V setDescription setPrice (F)V setCycle -(Lpl/gabgal/submanager/backend/enums/Cycle;)V setDateOfLastPayment (Ljava/util/Date;)V setUser ,(Lpl/gabgal/submanager/backend/model/User;)V setCurrency 0(Lpl/gabgal/submanager/backend/model/Currency;)V setPayments (Ljava/util/List;)V LocalVariableTypeTable A(Ljava/util/List<Lpl/gabgal/submanager/backend/model/Payment;>;)V (JLjava/lang/String;Ljava/lang/String;FLpl/gabgal/submanager/backend/enums/Cycle;Ljava/util/Date;Lpl/gabgal/submanager/backend/model/User;Lpl/gabgal/submanager/backend/model/Currency;Ljava/util/List;)V (JLjava/lang/String;Ljava/lang/String;FLpl/gabgal/submanager/backend/enums/Cycle;Ljava/util/Date;Lpl/gabgal/submanager/backend/model/User;Lpl/gabgal/submanager/backend/model/Currency;Ljava/util/List<Lpl/gabgal/submanager/backend/model/Payment;>;)V 
SourceFile Subscription.java Ljakarta/persistence/Entity; NestMembers InnerClasses SubscriptionBuilder !  -   	     7     8   9  :e ; < =  >s ?     7     =  @Z A          7     =  @Z A     7     B  Ce D E =  @Z A     7     F  Ce G H =  >s I @Z A  " #  7     J   K  >s L @Z A  & '  7     J   K  >s M @Z A  * +  N    O 7     P  Qs R S[ e T U VZ W  	 X Y  Z           Y     [        \     ]    ^ _  Z   /     *     [        `        a b   \     ]    c d  Z   /     * 
    [        `        a b   \     ]    e d  Z   /     *     [        `        a b   \     ]    f g  Z   /     *     [        `        a b   \     ]    h i  Z   /     *     [       # `        a b   \     ]    j k  Z   /     *     [       ' `        a b   \     ]    l m  Z   /     *      [       + `        a b   \     ]    n o  Z   /     * $    [       / `        a b   \     ]    p q  Z   /     * (    [       2 `        a b   N    r \     ]    s t  Z   :     *     [        `        a b         u      \     ]    v w  Z   :     *+ 
    [        `        a b         u      \     ]    x w  Z   :     *+     [        `        a b         u      \     ]    y z  Z   :     *#     [        `        a b         u      \     ]    { |  Z   :     *+     [        `        a b         u      \     ]    } ~  Z   :     *+     [        `        a b         u      \     ]       Z   :     *+      [        `        a b      " #  u    "  \     ]       Z   :     *+ $    [        `        a b      & '  u    &  \     ]       Z   L     *+ (    [        `        a b      * +          * O  u    *  N     \     ]       Z   I     * ,* / * 4Y 6 (    [         !  1 `        a b   \     ]       Z        K* ,* / * 4Y 6 (* *- 
* * * * *  *	 $*
 (    [         !  1   `   f 
   K a b     K      K      K      K      K      K      K " #    K & ' 	   K * + 
        K * O 
 u   %	             "  &  *  N     \     ]         7                 
     	
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/model/User$UserBuilder.class`

```
   A U
      java/lang/Object <init> ()V	  	 
   3pl/gabgal/submanager/backend/model/User$UserBuilder userId Ljava/lang/Long;	     username Ljava/lang/String;	     email	     password	     role )Lpl/gabgal/submanager/backend/enums/Role;	     
subscriptions Ljava/util/List;   'pl/gabgal/submanager/backend/model/User
  "  # (Ljava/lang/Long;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Lpl/gabgal/submanager/backend/enums/Role;Ljava/util/List;)V
 % & ' ( ) java/lang/String valueOf &(Ljava/lang/Object;)Ljava/lang/String;   + , - makeConcatWithConstants ~(Ljava/lang/Long;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String; RuntimeInvisibleAnnotations Llombok/Generated; 	Signature CLjava/util/List<Lpl/gabgal/submanager/backend/model/Subscription;>; Code LineNumberTable LocalVariableTable this 5Lpl/gabgal/submanager/backend/model/User$UserBuilder; G(Ljava/lang/Long;)Lpl/gabgal/submanager/backend/model/User$UserBuilder; MethodParameters I(Ljava/lang/String;)Lpl/gabgal/submanager/backend/model/User$UserBuilder; `(Lpl/gabgal/submanager/backend/enums/Role;)Lpl/gabgal/submanager/backend/model/User$UserBuilder; G(Ljava/util/List;)Lpl/gabgal/submanager/backend/model/User$UserBuilder; LocalVariableTypeTable z(Ljava/util/List<Lpl/gabgal/submanager/backend/model/Subscription;>;)Lpl/gabgal/submanager/backend/model/User$UserBuilder; build +()Lpl/gabgal/submanager/backend/model/User; toString ()Ljava/lang/String; 
SourceFile 	User.java NestHost BootstrapMethods G TUser.UserBuilder(userId=, username=, email=, password=, role=, subscriptions=) I
 J K L , M $java/lang/invoke/StringConcatFactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/invoke/CallSite; InnerClasses UserBuilder Q %java/lang/invoke/MethodHandles$Lookup S java/lang/invoke/MethodHandles Lookup !          .     /       .     /       .     /       .     /       .     /       0    1 .     /   	      2   /     *     3        4        5 6   .     /     7  2   ;     *+ *    3        4        5 6         8      .     /     9  2   ;     *+ 
*    3        4        5 6         8      .     /     9  2   ;     *+ *    3        4        5 6         8      .     /     9  2   ;     *+ *    3        4        5 6         8      .     /     :  2   ;     *+ *    3        4        5 6         8      .     /     ;  2   M     *+ *    3        4        5 6         <         1  8      0    = .     /    > ?  2   J       Y* * 
* * * *  !    3        4         5 6   .     /    @ A  2   N     $* * 
* * *  $*  $ *      3        4       $ 5 6   .     /    B    C .     /   D     E     H  F N       O 	 P R T 
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/model/User.class`

```
   A   Borg/springframework/security/core/authority/SimpleGrantedAuthority	      'pl/gabgal/submanager/backend/model/User role )Lpl/gabgal/submanager/backend/enums/Role;
 
   
  'pl/gabgal/submanager/backend/enums/Role name ()Ljava/lang/String;
     <init> (Ljava/lang/String;)V      java/util/List of $(Ljava/lang/Object;)Ljava/util/List;  3pl/gabgal/submanager/backend/model/User$UserBuilder
     ()V	     ! userId Ljava/lang/Long;	  # $ % username Ljava/lang/String;	  ' ( % email	  * + % password	  - . / 
subscriptions Ljava/util/List;
 1  2 java/lang/Object	 
 4 5  USER 7 java/util/ArrayList
 6  : 9org/springframework/security/core/userdetails/UserDetails RuntimeVisibleAnnotations Ljakarta/persistence/Id; $Ljakarta/persistence/GeneratedValue; strategy $Ljakarta/persistence/GenerationType; IDENTITY Ljakarta/persistence/Column; user_id unique    nullable      Ljakarta/persistence/Enumerated; value Ljakarta/persistence/EnumType; STRING 	Signature CLjava/util/List<Lpl/gabgal/submanager/backend/model/Subscription;>; Ljakarta/persistence/OneToMany; mappedBy user cascade !Ljakarta/persistence/CascadeType; ALL 
orphanRemoval getAuthorities ()Ljava/util/Collection; Code LineNumberTable LocalVariableTable this )Lpl/gabgal/submanager/backend/model/User; O()Ljava/util/Collection<+Lorg/springframework/security/core/GrantedAuthority;>; isAccountNonExpired ()Z isAccountNonLocked isCredentialsNonExpired 	isEnabled builder 7()Lpl/gabgal/submanager/backend/model/User$UserBuilder; RuntimeInvisibleAnnotations Llombok/Generated; 	getUserId ()Ljava/lang/Long; getUsername getEmail getPassword getRole +()Lpl/gabgal/submanager/backend/enums/Role; getSubscriptions ()Ljava/util/List; E()Ljava/util/List<Lpl/gabgal/submanager/backend/model/Subscription;>; 	setUserId (Ljava/lang/Long;)V MethodParameters setUsername setEmail setPassword setRole ,(Lpl/gabgal/submanager/backend/enums/Role;)V setSubscriptions (Ljava/util/List;)V LocalVariableTypeTable F(Ljava/util/List<Lpl/gabgal/submanager/backend/model/Subscription;>;)V (Ljava/lang/Long;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Lpl/gabgal/submanager/backend/enums/Role;Ljava/util/List;)V (Ljava/lang/Long;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Lpl/gabgal/submanager/backend/enums/Role;Ljava/util/List<Lpl/gabgal/submanager/backend/model/Subscription;>;)V 
SourceFile 	User.java Ljakarta/persistence/Entity; Ljakarta/persistence/Table; users NestMembers InnerClasses UserBuilder !  1  9     !  ;     <   =  >e ? @ A  
s B  $ %  ;     A  CZ D EZ F  ( %  ;     A  CZ D EZ F  + %  ;     A  EZ F     ;     G  He I J A  EZ F  . /  K    L ;     M  Ns O P[ e Q R SZ D   T U  V   <      Y*  	      W       - X        Y Z   K    [  \ ]  V   ,         W       2 X        Y Z    ^ ]  V   ,         W       7 X        Y Z    _ ]  V   ,         W       < X        Y Z    ` ]  V   ,         W       A X        Y Z   	 a b  V           Y     W        c     d    e f  V   /     *     W        X        Y Z   c     d    g   V   /     * "    W        X        Y Z   c     d    h   V   /     * &    W        X        Y Z   c     d    i   V   /     * )    W       " X        Y Z   c     d    j k  V   /     *     W       & X        Y Z   c     d    l m  V   /     * ,    W       ) X        Y Z   K    n c     d    o p  V   :     *+     W        X        Y Z        !  q       c     d    r   V   :     *+ "    W        X        Y Z      $ %  q    $  c     d    s   V   :     *+ &    W        X        Y Z      ( %  q    (  c     d    t   V   :     *+ )    W        X        Y Z      + %  q    +  c     d    u v  V   :     *+     W        X        Y Z         q      c     d    w x  V   L     *+ ,    W        X        Y Z      . /  y        . L  q    .  K    z c     d       V   I     * 0* 3 * 6Y 8 ,    W         $  ( X        Y Z   c     d     {  V        8* 0* 3 * 6Y 8 ,*+ *, "*- &* )* * ,    W         $  (   X   H    8 Y Z     8   !    8 $ %    8 ( %    8 + %    8      8 . /  y       8 . L  q       $  (  +    .  K    | c     d    }    ~ ;          
s           
     	
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/repository/CurrencyRepository.class`

```
   A   :pl/gabgal/submanager/backend/repository/CurrencyRepository  java/lang/Object  5org/springframework/data/jpa/repository/JpaRepository findByShortName ((Ljava/lang/String;)Ljava/util/Optional; MethodParameters 	shortName 	Signature W(Ljava/lang/String;)Ljava/util/Optional<Lpl/gabgal/submanager/backend/model/Currency;>; Ljava/lang/Object;Lorg/springframework/data/jpa/repository/JpaRepository<Lpl/gabgal/submanager/backend/model/Currency;Ljava/lang/Long;>; 
SourceFile CurrencyRepository.java           	    
             
     
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/repository/PaymentRepository.class`

```
   A $  9pl/gabgal/submanager/backend/repository/PaymentRepository  java/lang/Object  5org/springframework/data/jpa/repository/JpaRepository findUnNotifiedPayments ()Ljava/util/List; 	Signature @()Ljava/util/List<Lpl/gabgal/submanager/backend/model/Payment;>; RuntimeVisibleAnnotations /Lorg/springframework/data/jpa/repository/Query; value SELECT * FROM payment WHERE status = 'UNPROCESSED' AND notifiaction_status = 'UNNOTIFIED' AND DATE(date_of_payment) = CURRENT_DATE + INTERVAL '1 day' nativeQuery    findAllByUserId "(Ljava/lang/Long;)Ljava/util/List; MethodParameters userId P(Ljava/lang/Long;)Ljava/util/List<Lpl/gabgal/submanager/backend/model/Payment;>; BSELECT p FROM Payment p WHERE p.subscription.user.userId = :userId "RuntimeVisibleParameterAnnotations 1Lorg/springframework/data/repository/query/Param; findUnprocessedPayments [SELECT * FROM payment WHERE status = 'UNPROCESSED' AND DATE(date_of_payment) = CURRENT_DATE findByIdWithUser &(Ljava/lang/Long;)Ljava/util/Optional; id T(Ljava/lang/Long;)Ljava/util/Optional<Lpl/gabgal/submanager/backend/model/Payment;>; _SELECT p FROM Payment p JOIN FETCH p.subscription s JOIN FETCH s.user u WHERE p.paymentId = :id Ljava/lang/Object;Lorg/springframework/data/jpa/repository/JpaRepository<Lpl/gabgal/submanager/backend/model/Payment;Ljava/lang/Long;>; 
SourceFile PaymentRepository.java +Lorg/springframework/stereotype/Repository;           	    
        
s  Z            	            
s         
s     	    
        
s  Z            	            
s         
s   	      !    "      #  
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/repository/SubscriptionRepository.class`

```
   A   >pl/gabgal/submanager/backend/repository/SubscriptionRepository  java/lang/Object  5org/springframework/data/jpa/repository/JpaRepository findAllByUserId "(Ljava/lang/Long;)Ljava/util/List; MethodParameters userId 	Signature U(Ljava/lang/Long;)Ljava/util/List<Lpl/gabgal/submanager/backend/model/Subscription;>; RuntimeVisibleAnnotations /Lorg/springframework/data/jpa/repository/Query; value :SELECT s FROM Subscription s WHERE s.user.userId = :userId "RuntimeVisibleParameterAnnotations 1Lorg/springframework/data/repository/query/Param; findByIdAndMatchUser 6(Ljava/lang/Long;Ljava/lang/Long;)Ljava/util/Optional; subscriptionId i(Ljava/lang/Long;Ljava/lang/Long;)Ljava/util/Optional<Lpl/gabgal/submanager/backend/model/Subscription;>; aSELECT s FROM Subscription s WHERE s.user.userId = :userId AND s.subscriptionId = :subscriptionId Ljava/lang/Object;Lorg/springframework/data/jpa/repository/JpaRepository<Lpl/gabgal/submanager/backend/model/Subscription;Ljava/lang/Long;>; 
SourceFile SubscriptionRepository.java           	    
        
       s         s 
    	   	    
        
       s         s     s 
           
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/repository/UserRepository.class`

```
   A   6pl/gabgal/submanager/backend/repository/UserRepository  java/lang/Object  5org/springframework/data/jpa/repository/JpaRepository findByUsername ((Ljava/lang/String;)Ljava/util/Optional; MethodParameters username 	Signature S(Ljava/lang/String;)Ljava/util/Optional<Lpl/gabgal/submanager/backend/model/User;>; findByEmail email 
findByRole ?(Lpl/gabgal/submanager/backend/enums/Role;)Ljava/util/Optional; role j(Lpl/gabgal/submanager/backend/enums/Role;)Ljava/util/Optional<Lpl/gabgal/submanager/backend/model/User;>; existsByUsername (Ljava/lang/String;)Z 
existsByEmail Ljava/lang/Object;Lorg/springframework/data/jpa/repository/JpaRepository<Lpl/gabgal/submanager/backend/model/User;Ljava/lang/Long;>; 
SourceFile UserRepository.java RuntimeVisibleAnnotations +Lorg/springframework/stereotype/Repository; FLorg/springframework/data/jpa/repository/config/EnableJpaRepositories;           	    
        
   	               	               	    
      	                     
       
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/service/AuthService.class`

```
   A 	      0pl/gabgal/submanager/backend/service/AuthService userRepository 8Lpl/gabgal/submanager/backend/repository/UserRepository;
  	 
   0pl/gabgal/submanager/backend/dto/RegisterRequest username ()Ljava/lang/String;      6pl/gabgal/submanager/backend/repository/UserRepository existsByUsername (Ljava/lang/String;)Z  java/lang/RuntimeException  Username already exists
     <init> (Ljava/lang/String;)V
     email      
existsByEmail " Email already exists
 $ % & ' ( 'pl/gabgal/submanager/backend/model/User builder 7()Lpl/gabgal/submanager/backend/model/User$UserBuilder;
 * + ,  - 3pl/gabgal/submanager/backend/model/User$UserBuilder I(Ljava/lang/String;)Lpl/gabgal/submanager/backend/model/User$UserBuilder;
 * /  -	  1 2 3 passwordEncoder >Lorg/springframework/security/crypto/password/PasswordEncoder;
  5 6  password 8 9 : ; < <org/springframework/security/crypto/password/PasswordEncoder encode ,(Ljava/lang/CharSequence;)Ljava/lang/String;
 * > 6 -	 @ A B C D 'pl/gabgal/submanager/backend/enums/Role USER )Lpl/gabgal/submanager/backend/enums/Role;
 * F G H role `(Lpl/gabgal/submanager/backend/enums/Role;)Lpl/gabgal/submanager/backend/model/User$UserBuilder;
 * J K L build +()Lpl/gabgal/submanager/backend/model/User;  N O P save &(Ljava/lang/Object;)Ljava/lang/Object;	  R S T 
jwtService 1Lpl/gabgal/submanager/backend/service/JwtService;
 V W X Y Z /pl/gabgal/submanager/backend/service/JwtService 
generateToken O(Lorg/springframework/security/core/userdetails/UserDetails;)Ljava/lang/String; \ java/util/HashMap
 [ ^  _ ()V
 V a b c generateRefresh ^(Ljava/util/Map;Lorg/springframework/security/core/userdetails/UserDetails;)Ljava/lang/String;
 e f g ' h 7pl/gabgal/submanager/backend/dto/AuthenticationResponse Y()Lpl/gabgal/submanager/backend/dto/AuthenticationResponse$AuthenticationResponseBuilder;
 j k l m n Upl/gabgal/submanager/backend/dto/AuthenticationResponse$AuthenticationResponseBuilder authenticationToken k(Ljava/lang/String;)Lpl/gabgal/submanager/backend/dto/AuthenticationResponse$AuthenticationResponseBuilder;
 j p q n refreshToken
 j s K t ;()Lpl/gabgal/submanager/backend/dto/AuthenticationResponse;	  v w x authenticationManager CLorg/springframework/security/authentication/AuthenticationManager; z Oorg/springframework/security/authentication/UsernamePasswordAuthenticationToken
 | 	 } -pl/gabgal/submanager/backend/dto/LoginRequest
 | 5
 y    '(Ljava/lang/Object;Ljava/lang/Object;)V      Aorg/springframework/security/authentication/AuthenticationManager authenticate f(Lorg/springframework/security/core/Authentication;)Lorg/springframework/security/core/Authentication;     findByUsername ((Ljava/lang/String;)Ljava/util/Optional;      get ()Ljava/util/function/Supplier;
      java/util/Optional orElseThrow 1(Ljava/util/function/Supplier;)Ljava/lang/Object;
 V    extractUserName &(Ljava/lang/String;)Ljava/lang/String;  
 V    
validateToken '(Ljava/lang/String;)Ljava/lang/Boolean;
  ^  java/lang/Object  "java/lang/IllegalArgumentException  Invalid refresh token
    Invalid username or password register m(Lpl/gabgal/submanager/backend/dto/RegisterRequest;)Lpl/gabgal/submanager/backend/dto/AuthenticationResponse; Code LineNumberTable LocalVariableTable this 2Lpl/gabgal/submanager/backend/service/AuthService; request 2Lpl/gabgal/submanager/backend/dto/RegisterRequest; user )Lpl/gabgal/submanager/backend/model/User; jwtToken Ljava/lang/String; 
StackMapTable MethodParameters login j(Lpl/gabgal/submanager/backend/dto/LoginRequest;)Lpl/gabgal/submanager/backend/dto/AuthenticationResponse; /Lpl/gabgal/submanager/backend/dto/LoginRequest; M(Ljava/lang/String;)Lpl/gabgal/submanager/backend/dto/AuthenticationResponse; newRefreshToken token (Lpl/gabgal/submanager/backend/repository/UserRepository;Lorg/springframework/security/crypto/password/PasswordEncoder;Lorg/springframework/security/authentication/AuthenticationManager;Lpl/gabgal/submanager/backend/service/JwtService;)V RuntimeInvisibleAnnotations Llombok/Generated; lambda$refreshToken$1 &()Ljava/lang/IllegalArgumentException; lambda$login$0 
SourceFile AuthService.java RuntimeVisibleAnnotations (Lorg/springframework/stereotype/Service; BootstrapMethods  ()Ljava/lang/Object; 
      
     
      "java/lang/invoke/LambdaMetafactory metafactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invoke/MethodType;)Ljava/lang/invoke/CallSite; InnerClasses UserBuilder AuthenticationResponseBuilder  %java/lang/invoke/MethodHandles$Lookup  java/lang/invoke/MethodHandles Lookup !            2 3    w x    S T          4     * +  
  
 Y * +    
 Y!  #+  )+  .* 0+ 4 7  = ? E IM* , M W* Q, UN* Q [Y ], `: d- i o r       J         *  4 ! 8 " ? # J $ X % [ & _ ( j * s +  ,  -  .  /  ,    4               _ 5    s !      q                           \* u yY+ {+ ~   W* + {       $M* Q, UN* Q [Y ], `: d- i o r       .    3 	 4  3  6 2 8 ; 9 L : P ; U < X = [ :    4    \       \    2 *    ; !    L  q           q           G* * Q+        $M* Q, UN* Q [Y ], `: d- i o r       "    B  C & D 7 E ; F @ G C H F E    4    G       G q    *    & !    7         q          =     	* Q+            L        	       	                  l     * *+ *, 0*- u* Q               4                  2 3     w x     S T        2  w  S         
       "      
 Y            B
       "      
 Y            6                                   * $  	 j e  	    
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/service/CurrencyService.class`

```
   A 8
      java/lang/Object <init> ()V	  	 
   4pl/gabgal/submanager/backend/service/CurrencyService currencyRepository <Lpl/gabgal/submanager/backend/repository/CurrencyRepository;      :pl/gabgal/submanager/backend/repository/CurrencyRepository findAll ()Ljava/util/List;
      java/lang/Long valueOf (J)Ljava/lang/Long;     findById ((Ljava/lang/Object;)Ljava/util/Optional;      findByShortName ((Ljava/lang/String;)Ljava/util/Optional; ?(Lpl/gabgal/submanager/backend/repository/CurrencyRepository;)V Code LineNumberTable LocalVariableTable this 6Lpl/gabgal/submanager/backend/service/CurrencyService; MethodParameters getAllCurrencies 	Signature A()Ljava/util/List<Lpl/gabgal/submanager/backend/model/Currency;>; getCurrencyById (J)Ljava/util/Optional; id J F(J)Ljava/util/Optional<Lpl/gabgal/submanager/backend/model/Currency;>; getCurrencyByCode code Ljava/lang/String; W(Ljava/lang/String;)Ljava/util/Optional<Lpl/gabgal/submanager/backend/model/Currency;>; 
SourceFile CurrencyService.java RuntimeVisibleAnnotations (Lorg/springframework/stereotype/Service; !              !  "   F     
* *+     #          	  $       
 % &     
    '        (   "   4     
*  
     #        $       
 % &   )    *  + ,  "   B     *        #        $        % &      - .  '    -   )    /  0    "   ?     * +      #        $        % &      1 2  '    1   )    3  4    5 6     7  
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/service/EmailService.class`

```
   A 	      1pl/gabgal/submanager/backend/service/EmailService 
mailSender 2Lorg/springframework/mail/javamail/JavaMailSender;  	 
   0org/springframework/mail/javamail/JavaMailSender createMimeMessage %()Ljakarta/mail/internet/MimeMessage;  3org/springframework/mail/javamail/MimeMessageHelper
 
    <init> '(Ljakarta/mail/internet/MimeMessage;Z)V
 
    setTo (Ljava/lang/String;)V  Payment Notification
 
    
setSubject  java/lang/StringBuilder
      ()V " <html><body>
  $ % & append -(Ljava/lang/String;)Ljava/lang/StringBuilder; ( <h3>Hello,</h3> * 7<p>Here are the subscriptions that will renew soon:</p>   , - . accept 8(Ljava/lang/StringBuilder;)Ljava/util/function/Consumer; 0 1 2 3 4 java/util/List forEach  (Ljava/util/function/Consumer;)V 6 </body></html>
  8 9 : toString ()Ljava/lang/String;
 
 < = > setText (Ljava/lang/String;Z)V  @ A B send &(Ljakarta/mail/internet/MimeMessage;)V
 D  E java/lang/Object G <hr> I <header><strong> K subscription_title M N O P Q 
java/util/Map get &(Ljava/lang/Object;)Ljava/lang/Object;
  S % T -(Ljava/lang/Object;)Ljava/lang/StringBuilder; V </strong></header> X "<p><strong>Renewal Date:</strong>  Z payment_date \ </p> ^ <p><strong>Amount:</strong>  ` subscription_price 	sendEmail %(Ljava/lang/String;Ljava/util/List;)V Code LineNumberTable LocalVariableTable this 3Lpl/gabgal/submanager/backend/service/EmailService; to Ljava/lang/String; data Ljava/util/List; message #Ljakarta/mail/internet/MimeMessage; helper 5Lorg/springframework/mail/javamail/MimeMessageHelper; text Ljava/lang/StringBuilder; LocalVariableTypeTable GLjava/util/List<Ljava/util/Map<Ljava/lang/String;Ljava/lang/Object;>;>; 
Exceptions v &org/springframework/mail/MailException x jakarta/mail/MessagingException MethodParameters 	Signature \(Ljava/lang/String;Ljava/util/List<Ljava/util/Map<Ljava/lang/String;Ljava/lang/Object;>;>;)V 5(Lorg/springframework/mail/javamail/JavaMailSender;)V RuntimeInvisibleAnnotations Llombok/Generated; lambda$sendEmail$0 +(Ljava/lang/StringBuilder;Ljava/util/Map;)V sub Ljava/util/Map; 
SourceFile EmailService.java RuntimeVisibleAnnotations (Lorg/springframework/stereotype/Service; BootstrapMethods  (Ljava/lang/Object;)V 
      (Ljava/util/Map;)V 
      "java/lang/invoke/LambdaMetafactory metafactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invoke/MethodType;)Ljava/lang/invoke/CallSite; InnerClasses  %java/lang/invoke/MethodHandles$Lookup  java/lang/invoke/MethodHandles Lookup !  D           a b  c       n*   N 
Y- :+   Y :! #W' #W) #W, +   / 5 #W 7 ;* - ?     d   6 
    
      "  +  3  ;  C   P ' X ) c + m , e   >    n f g     n h i    n j k  
 d l m   Y n o  + C p q  r       n j s  t     u w y   	 h   j   z    {   |  c   >     
* C*+     d        e       
 f g     
    y      }     ~  
    c        M*F #W*H #+J L  RU #W*W #+Y L  R[ #W*] #+_ L  R[ #W    d       !  "  # 5 $ L % e       M p q     M                               
     
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/service/JwtService.class`

```
   A
      java/lang/Object <init> ()V	  	 
   /pl/gabgal/submanager/backend/service/JwtService userDetailsService BLorg/springframework/security/core/userdetails/UserDetailsService;      apply ()Ljava/util/function/Function;
     extractClaim C(Ljava/lang/String;Ljava/util/function/Function;)Ljava/lang/Object;  java/lang/String
     extractAllClaims ,(Ljava/lang/String;)Lio/jsonwebtoken/Claims;      java/util/function/Function &(Ljava/lang/Object;)Ljava/lang/Object; ! java/util/HashMap
   
  $ % & 
generateToken ^(Ljava/util/Map;Lorg/springframework/security/core/userdetails/UserDetails;)Ljava/lang/String;
 ( ) * + , io/jsonwebtoken/Jwts builder ()Lio/jsonwebtoken/JwtBuilder; . / 0 1 2 9org/springframework/security/core/userdetails/UserDetails getUsername ()Ljava/lang/String; 4 5 6 7 8 io/jsonwebtoken/JwtBuilder 
setSubject 0(Ljava/lang/String;)Lio/jsonwebtoken/JwtBuilder; : roles . < = > getAuthorities ()Ljava/util/Collection; 4 @ A B claim B(Ljava/lang/String;Ljava/lang/Object;)Lio/jsonwebtoken/JwtBuilder; D java/util/Date
 F G H I J java/lang/System currentTimeMillis ()J
 C L  M (J)V 4 O P Q setIssuedAt .(Ljava/util/Date;)Lio/jsonwebtoken/JwtBuilder;       4 U V Q 
setExpiration
  X Y Z getSignInKey ()Ljava/security/Key;	 \ ] ^ _ ` "io/jsonwebtoken/SignatureAlgorithm HS256 $Lio/jsonwebtoken/SignatureAlgorithm; 4 b c d signWith U(Ljava/security/Key;Lio/jsonwebtoken/SignatureAlgorithm;)Lio/jsonwebtoken/JwtBuilder; 4 f g 2 compact
  i j k extractUserName &(Ljava/lang/String;)Ljava/lang/String;
  m n o equals (Ljava/lang/Object;)Z
  q r s isTokenExpired (Ljava/lang/String;)Z
 u v w x y java/lang/Boolean valueOf (Z)Ljava/lang/Boolean;
  { | } extractExpiration $(Ljava/lang/String;)Ljava/util/Date;
 C 
 C    before (Ljava/util/Date;)Z  
 (    
parserBuilder $()Lio/jsonwebtoken/JwtParserBuilder;       io/jsonwebtoken/JwtParserBuilder 
setSigningKey 7(Ljava/security/Key;)Lio/jsonwebtoken/JwtParserBuilder;     build ()Lio/jsonwebtoken/JwtParser;      io/jsonwebtoken/JwtParser parseClaimsJws )(Ljava/lang/String;)Lio/jsonwebtoken/Jws;      io/jsonwebtoken/Jws getBody ()Ljava/lang/Object;  io/jsonwebtoken/Claims	      io/jsonwebtoken/io/Decoders BASE64 Lio/jsonwebtoken/io/Decoder;	     secret Ljava/lang/String;      io/jsonwebtoken/io/Decoder decode  [B
      io/jsonwebtoken/security/Keys 
hmacShaKeyFor ([B)Ljavax/crypto/SecretKey; 4    	setClaims -(Ljava/util/Map;)Lio/jsonwebtoken/JwtBuilder;	     
expiration J
     s %io/micrometer/common/util/StringUtils 
isNotEmpty      @org/springframework/security/core/userdetails/UserDetailsService loadUserByUsername O(Ljava/lang/String;)Lorg/springframework/security/core/userdetails/UserDetails;
     isTokenValid b(Ljava/lang/String;Lorg/springframework/security/core/userdetails/UserDetails;)Ljava/lang/Boolean; RuntimeVisibleAnnotations 4Lorg/springframework/beans/factory/annotation/Value; value 
${jwt.secret} ${jwt.expiration} E(Lorg/springframework/security/core/userdetails/UserDetailsService;)V Code LineNumberTable LocalVariableTable this 1Lpl/gabgal/submanager/backend/service/JwtService; MethodParameters token claimsResolver Ljava/util/function/Function; claims Lio/jsonwebtoken/Claims; LocalVariableTypeTable :Ljava/util/function/Function<Lio/jsonwebtoken/Claims;TT;>; 	Signature g<T:Ljava/lang/Object;>(Ljava/lang/String;Ljava/util/function/Function<Lio/jsonwebtoken/Claims;TT;>;)TT; O(Lorg/springframework/security/core/userdetails/UserDetails;)Ljava/lang/String; userDetails ;Lorg/springframework/security/core/userdetails/UserDetails; extraClaims Ljava/util/Map; ALjava/util/Map<Ljava/lang/String;Lio/jsonwebtoken/lang/Objects;>; (Ljava/util/Map<Ljava/lang/String;Lio/jsonwebtoken/lang/Objects;>;Lorg/springframework/security/core/userdetails/UserDetails;)Ljava/lang/String; username 
StackMapTable keyBytes generateRefresh 
validateToken '(Ljava/lang/String;)Ljava/lang/Boolean; 
SourceFile JwtService.java (Lorg/springframework/stereotype/Service; BootstrapMethods 	     2 
getSubject  ,(Lio/jsonwebtoken/Claims;)Ljava/lang/String;	      
getExpiration ()Ljava/util/Date; *(Lio/jsonwebtoken/Claims;)Ljava/util/Date;
 "java/lang/invoke/LambdaMetafactory metafactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invoke/MethodType;)Ljava/lang/invoke/CallSite; InnerClasses %java/lang/invoke/MethodHandles$Lookup
 java/lang/invoke/MethodHandles Lookup !                 s             s               F     
* *+               	         
       
            j k     B     *+ 
               "                                 l     *+ N,-         
    &  '    *                                        	             %      A     
*  Y "+ #           +        
       
            % &          O ', -  3 9, ;  ?  CY E K N  CY E Ra K T * W [ a  e        "    1  2  3  4 . 5 > 6 I 7 N 1         O       O      O           O       	                        $*+ hN-, -  l *+ p   t       
    ;  <    *    $       $      $            
   @    	        r s     W     *+ z CY ~              @                       @         | }     B     *+     C           E                                 h       * W    +                I  J  K  L  M  I                             Y Z     M      *    L+        
    Q  R                    &          I '+  , -  3  CY E K N  CY E* a K T * W [ a  e        "    V  W 
 X  Y ' Z 8 [ C \ H V         I       I      I           I       	                        ,*+ hM,  *+ p * ,  N*+- ʰ t           a  b  c   d ' f    *          ,       ,     &         '                                   	   
 
 
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/service/PaymentService$1.class`

```
   A )
      (pl/gabgal/submanager/backend/enums/Cycle values -()[Lpl/gabgal/submanager/backend/enums/Cycle;	  	 
   5pl/gabgal/submanager/backend/service/PaymentService$1 3$SwitchMap$pl$gabgal$submanager$backend$enums$Cycle [I	     MONTHLY *Lpl/gabgal/submanager/backend/enums/Cycle;
     ordinal ()I  java/lang/NoSuchFieldError	     YEARLY  java/lang/Object <clinit> ()V Code LineNumberTable LocalVariableTable 
StackMapTable 
SourceFile PaymentService.java EnclosingMethod & 3pl/gabgal/submanager/backend/service/PaymentService NestHost InnerClasses                   j     ( 
   
 O K   O K  	     # &          $        !    W  M    "    # $    %   '    % (   
      
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/service/PaymentService.class`

```
   AX
      java/util/Date 	toInstant ()Ljava/time/Instant;
  	 
   java/time/ZoneId 
systemDefault ()Ljava/time/ZoneId;
      java/time/Instant atZone -(Ljava/time/ZoneId;)Ljava/time/ZonedDateTime;
      java/time/ZonedDateTime toLocalDate ()Ljava/time/LocalDate;	      5pl/gabgal/submanager/backend/service/PaymentService$1 3$SwitchMap$pl$gabgal$submanager$backend$enums$Cycle [I
   ! " # $ (pl/gabgal/submanager/backend/enums/Cycle ordinal ()I & java/lang/MatchException
 % ( ) * <init> *(Ljava/lang/String;Ljava/lang/Throwable;)V
 , - . / 0 java/time/LocalDate 
plusMonths (J)Ljava/time/LocalDate;
 , 2 3 0 	plusYears
 5 6 7 8 9 ?org/springframework/security/core/context/SecurityContextHolder 
getContext =()Lorg/springframework/security/core/context/SecurityContext; ; < = > ? 9org/springframework/security/core/context/SecurityContext getAuthentication 4()Lorg/springframework/security/core/Authentication; A B C D E 0org/springframework/security/core/Authentication getName ()Ljava/lang/String;	 G H I J K 3pl/gabgal/submanager/backend/service/PaymentService userRepository 8Lpl/gabgal/submanager/backend/repository/UserRepository; M N O P Q 6pl/gabgal/submanager/backend/repository/UserRepository findByUsername ((Ljava/lang/String;)Ljava/util/Optional;   S T U get ()Ljava/util/function/Supplier;
 W X Y Z [ java/util/Optional orElseThrow 1(Ljava/util/function/Supplier;)Ljava/lang/Object; ] 'pl/gabgal/submanager/backend/model/User	 G _ ` a paymentRepository ;Lpl/gabgal/submanager/backend/repository/PaymentRepository;
 \ c d e 	getUserId ()Ljava/lang/Long; g h i j k 9pl/gabgal/submanager/backend/repository/PaymentRepository findAllByUserId "(Ljava/lang/Long;)Ljava/util/List; m n o p q java/util/List stream ()Ljava/util/stream/Stream;  s t u apply ()Ljava/util/function/Function; w x y z { java/util/stream/Stream map 8(Ljava/util/function/Function;)Ljava/util/stream/Stream;
 } ~    java/util/stream/Collectors toList ()Ljava/util/stream/Collector; w    collect 0(Ljava/util/stream/Collector;)Ljava/lang/Object;  *pl/gabgal/submanager/backend/model/Payment
   )  ()V
     setSubscription 4(Lpl/gabgal/submanager/backend/model/Subscription;)V
     setDateOfPayment (Ljava/util/Date;)V	      )pl/gabgal/submanager/backend/enums/Status PAID +Lpl/gabgal/submanager/backend/enums/Status;
     	setStatus .(Lpl/gabgal/submanager/backend/enums/Status;)V	      )pl/gabgal/submanager/backend/enums/Notify NOTIFIED +Lpl/gabgal/submanager/backend/enums/Notify;
     setNotificationStatus .(Lpl/gabgal/submanager/backend/enums/Notify;)V
 G    addCycleToDate Q(Ljava/util/Date;Lpl/gabgal/submanager/backend/enums/Cycle;)Ljava/time/LocalDate;
      
java/sql/Date valueOf &(Ljava/time/LocalDate;)Ljava/sql/Date;	     UNPROCESSED	     
UNNOTIFIED g    save &(Ljava/lang/Object;)Ljava/lang/Object; g    findByIdWithUser &(Ljava/lang/Long;)Ljava/util/Optional;  S
     getSubscription 3()Lpl/gabgal/submanager/backend/model/Subscription;
      /pl/gabgal/submanager/backend/model/Subscription getUser +()Lpl/gabgal/submanager/backend/model/User;
 \   E getUsername
      java/lang/String equals (Ljava/lang/Object;)Z  9org/springframework/security/access/AccessDeniedException  )You cannot process someone else's payment
   )  (Ljava/lang/String;)V
     getDateOfPayment ()Ljava/util/Date;
  
     getCycle ,()Lpl/gabgal/submanager/backend/enums/Cycle;  "java/lang/IllegalArgumentException  Unsupported cycle
    0pl/gabgal/submanager/backend/dto/PaymentResponse
     getPaymentId ()J
     	getStatus -()Lpl/gabgal/submanager/backend/enums/Status;
     getSubscriptionId
   )  @(JLpl/gabgal/submanager/backend/enums/Status;Ljava/util/Date;J)V
    java/lang/Object  Payment not found  Gorg/springframework/security/core/userdetails/UsernameNotFoundException  User not found!
   Code LineNumberTable LocalVariableTable this 5Lpl/gabgal/submanager/backend/service/PaymentService; date Ljava/util/Date; cycle *Lpl/gabgal/submanager/backend/enums/Cycle; 	localDate Ljava/time/LocalDate; 
StackMapTable MethodParameters getUserPayments ()Ljava/util/List; username Ljava/lang/String; user )Lpl/gabgal/submanager/backend/model/User; payments Ljava/util/List; LocalVariableTypeTable >Ljava/util/List<Lpl/gabgal/submanager/backend/model/Payment;>; 	Signature F()Ljava/util/List<Lpl/gabgal/submanager/backend/dto/PaymentResponse;>; createNewPayment o(Ljava/util/Date;Lpl/gabgal/submanager/backend/model/Subscription;Lpl/gabgal/submanager/backend/enums/Cycle;Z)V nextPaymentDate subscription 1Lpl/gabgal/submanager/backend/model/Subscription; isOld Z payment ,Lpl/gabgal/submanager/backend/model/Payment; processPayment D(Ljava/lang/Long;)Lpl/gabgal/submanager/backend/dto/PaymentResponse; 	paymentId Ljava/lang/Long; current baseDate nextDate next RuntimeVisibleAnnotations #Ljakarta/transaction/Transactional; v(Lpl/gabgal/submanager/backend/repository/PaymentRepository;Lpl/gabgal/submanager/backend/repository/UserRepository;)V RuntimeInvisibleAnnotations Llombok/Generated; lambda$processPayment$2 =()Lorg/springframework/security/access/AccessDeniedException; lambda$getUserPayments$1 `(Lpl/gabgal/submanager/backend/model/Payment;)Lpl/gabgal/submanager/backend/dto/PaymentResponse; lambda$getUserPayments$0 K()Lorg/springframework/security/core/userdetails/UsernameNotFoundException; 
SourceFile PaymentService.java (Lorg/springframework/stereotype/Service; NestMembers BootstrapMethods= ()Ljava/lang/Object;?
 G@566 D
 GE344H
 GI122L
MNOPQ "java/lang/invoke/LambdaMetafactory metafactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invoke/MethodType;)Ljava/lang/invoke/CallSite; InnerClassesT %java/lang/invoke/MethodHandles$LookupV java/lang/invoke/MethodHandles Lookup ! G      ` a    J K               J+   
 N , .             $      , %Y '-
 + -
 1N-          "  $ : % B & H )   *    J     J    J	
   < 
     0 ,	D ,   	  	            N 4 :  @ L* F+ L  R   V \M* ^, b f N- l  r   v  |   m      "    -  0  1 $ 3 2 5 = 6 B < M 5   *    N    @  $ *  2       2               \ Y :,  +      %*+- :      * ^  W      2    A 	 B  D  E  F " G - I 5 J ? K G L O O [ Q   H  5     \     \    \    \	
    \ !  	 S"# 
   	  - !       	      $%        4 :  @ M* ^+      V N-  Ķ , ͚ 
 Yշ ׿-  -  * ^-  W-   : -  ߶ .    ,               #
 + 
 1 
 Y : Y :-        * ^  W Y            j    U  W  X  Y $ [ 5 \ ? _ F ` M a X c d d  e  f  g  j  k  l  m  n  o  q  r  s  t  u  q   H       &'     $ (#  d )   W*   N+# 
     ?   L ,I ,   &  ,    -    ).    M     * *+ ^*, F                        ` a     J K    	 `  J /    0  
12    "      
 Y װ          Y
34    Y      Y* * * *             6  7 	 8 
 9  :  6       "#  
56    "      
 Y          1 7   8,    9  :     ;     K <>AK BCFK <GJR         SUW 
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/service/SubscriptionService.class`

```
   AV
      ?org/springframework/security/core/context/SecurityContextHolder 
getContext =()Lorg/springframework/security/core/context/SecurityContext;  	 
   9org/springframework/security/core/context/SecurityContext getAuthentication 4()Lorg/springframework/security/core/Authentication;      0org/springframework/security/core/Authentication getName ()Ljava/lang/String;	      8pl/gabgal/submanager/backend/service/SubscriptionService userRepository 8Lpl/gabgal/submanager/backend/repository/UserRepository;      6pl/gabgal/submanager/backend/repository/UserRepository findByUsername ((Ljava/lang/String;)Ljava/util/Optional;     ! " get ()Ljava/util/function/Supplier;
 $ % & ' ( java/util/Optional orElseThrow 1(Ljava/util/function/Supplier;)Ljava/lang/Object; * 'pl/gabgal/submanager/backend/model/User	  , - . currencyRepository <Lpl/gabgal/submanager/backend/repository/CurrencyRepository;
 0 1 2 3 4 :pl/gabgal/submanager/backend/dto/SubscriptionCreateRequest 
currencyId ()J
 6 7 8 9 : java/lang/Long valueOf (J)Ljava/lang/Long; < = > ? @ :pl/gabgal/submanager/backend/repository/CurrencyRepository findById ((Ljava/lang/Object;)Ljava/util/Optional;    C +pl/gabgal/submanager/backend/model/Currency E /pl/gabgal/submanager/backend/model/Subscription
 D G H I <init> ()V
 0 K L  title
 D N O P setTitle (Ljava/lang/String;)V
 0 R S  description
 U V W X Y java/lang/String isEmpty ()Z [  
 D ] ^ P setDescription
 0 ` a b price ()F
 D d e f setPrice (F)V
 0 h i j cycle ,()Lpl/gabgal/submanager/backend/enums/Cycle;
 D l m n setCycle -(Lpl/gabgal/submanager/backend/enums/Cycle;)V
 0 p q r dateOfLastPayment ()Ljava/util/Date;
 D t u v setDateOfLastPayment (Ljava/util/Date;)V
 D x y z setCurrency 0(Lpl/gabgal/submanager/backend/model/Currency;)V
 D | } ~ setUser ,(Lpl/gabgal/submanager/backend/model/User;)V	     subscriptionRepository @Lpl/gabgal/submanager/backend/repository/SubscriptionRepository;      >pl/gabgal/submanager/backend/repository/SubscriptionRepository save &(Ljava/lang/Object;)Ljava/lang/Object;	     paymentService 5Lpl/gabgal/submanager/backend/service/PaymentService;
      3pl/gabgal/submanager/backend/service/PaymentService createNewPayment o(Ljava/util/Date;Lpl/gabgal/submanager/backend/model/Subscription;Lpl/gabgal/submanager/backend/enums/Cycle;Z)V  5pl/gabgal/submanager/backend/dto/SubscriptionResponse
 D   4 getSubscriptionId
 D    getTitle
 D    getDescription
 D   b getPrice
 D   j getCycle
 D   r getDateOfLastPayment
 B    
getCurrencyId ()Ljava/lang/Long;
 6   4 	longValue
   H  d(JLjava/lang/String;Ljava/lang/String;FLpl/gabgal/submanager/backend/enums/Cycle;Ljava/util/Date;J)V   
 )    	getUserId     findAllByUserId "(Ljava/lang/Long;)Ljava/util/List;      java/util/List stream ()Ljava/util/stream/Stream;     apply ()Ljava/util/function/Function;      java/util/stream/Stream map 8(Ljava/util/function/Function;)Ljava/util/stream/Stream;
      java/util/stream/Collectors toList ()Ljava/util/stream/Collector;     collect 0(Ljava/util/stream/Collector;)Ljava/lang/Object;        findByIdAndMatchUser 6(Ljava/lang/Long;Ljava/lang/Long;)Ljava/util/Optional;   
 D    getCurrency /()Lpl/gabgal/submanager/backend/model/Currency;           delete (Ljava/lang/Object;)V
  G  java/lang/Object  +jakarta/persistence/EntityNotFoundException  4Subscription not found or you don't have permission!
   H P  Gorg/springframework/security/core/userdetails/UsernameNotFoundException  User not found!
    Subscription not found!  Currency not found! createSubscription u(Lpl/gabgal/submanager/backend/dto/SubscriptionCreateRequest;)Lpl/gabgal/submanager/backend/dto/SubscriptionResponse; Code LineNumberTable LocalVariableTable this :Lpl/gabgal/submanager/backend/service/SubscriptionService; request <Lpl/gabgal/submanager/backend/dto/SubscriptionCreateRequest; username Ljava/lang/String; user )Lpl/gabgal/submanager/backend/model/User; currency -Lpl/gabgal/submanager/backend/model/Currency; subscription 1Lpl/gabgal/submanager/backend/model/Subscription; savedSubscription 
StackMapTable MethodParameters getAllSubscriptions ()Ljava/util/List; 
subscriptions Ljava/util/List; LocalVariableTypeTable CLjava/util/List<Lpl/gabgal/submanager/backend/model/Subscription;>; 	Signature K()Ljava/util/List<Lpl/gabgal/submanager/backend/dto/SubscriptionResponse;>; getSubscriptionById :(J)Lpl/gabgal/submanager/backend/dto/SubscriptionResponse; subscriptionId J deleteSubscription (Ljava/lang/Long;)V Ljava/lang/Long; (Lpl/gabgal/submanager/backend/repository/SubscriptionRepository;Lpl/gabgal/submanager/backend/repository/UserRepository;Lpl/gabgal/submanager/backend/repository/CurrencyRepository;Lpl/gabgal/submanager/backend/service/PaymentService;)V RuntimeInvisibleAnnotations Llombok/Generated; lambda$deleteSubscription$7 /()Ljakarta/persistence/EntityNotFoundException; lambda$deleteSubscription$6 K()Lorg/springframework/security/core/userdetails/UsernameNotFoundException; lambda$getSubscriptionById$5 lambda$getSubscriptionById$4 lambda$getAllSubscriptions$3 j(Lpl/gabgal/submanager/backend/model/Subscription;)Lpl/gabgal/submanager/backend/dto/SubscriptionResponse; lambda$getAllSubscriptions$2 lambda$createSubscription$1 lambda$createSubscription$0 
SourceFile SubscriptionService.java RuntimeVisibleAnnotations (Lorg/springframework/stereotype/Service; BootstrapMethods, ()Ljava/lang/Object;.
 /%2
 3$6
 7# :
 ;!"">
 ? A
 BD
 EG
 HJ
KLMNO "java/lang/invoke/LambdaMetafactory metafactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invoke/MethodType;)Ljava/lang/invoke/CallSite; InnerClassesR %java/lang/invoke/MethodHandles$LookupT java/lang/invoke/MethodHandles Lookup !                 - .        
                
 M* ,      # )N* ++ / 5 ;  A   # B: DY F:+ J M+ Q T 
+ Q Z \+ _ c+ g k+ o s w- {*    D:* + o+ g * + o+ g  Y                f       "  # $ % 9 & A ( J ) S * k + t , } -  .  /  1  3  4  7  8  9  :  ;  <  =  >  7    H                    $    A   J    R    =  f   0 U ) B D  D    0 U ) B D  D U       	
          N    
 L* +      # )M* ,   N-        ɹ          "    C  E  F $ H 2 J = K B T M J    *    N      @    $ *   2  
     2                u    
 N* -      # ):*  5       # D: Y       ٶ          :    X  Z  [ % ] < ^ D ` J a O b T c Y d ^ e c f h g t `    4    u       u   g    % P   D 1                 K    
 M* ,      # )N* +-       # D:*              l  n  o $ q 7 r ? t J u    4    K       K   =    $ '   ?         H     l     * *+ *, *- +*                4                        - .               -         
     "      
 Y            r
     "      
 Y            o
     "      
 Y            ^
      "      
 Y            [
!"     t     * Y* * * * * * * ٶ          & 	   K  L 	 M 
 N  O  P  Q  R ) K        *  
#     "      
 Y            F
$     "      
 Y            &
%     "      
 Y            # &   '(    )  *   R I +-0I +14I +50I 89<I +=0I +@4I +C0I +F4P   
 QSU 
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/util/KeyGenerator.class`

```
   A W
      java/lang/Object <init> ()V	  	 
   "io/jsonwebtoken/SignatureAlgorithm HS256 $Lio/jsonwebtoken/SignatureAlgorithm;
      io/jsonwebtoken/security/Keys secretKeyFor >(Lio/jsonwebtoken/SignatureAlgorithm;)Ljavax/crypto/SecretKey;
      java/util/Base64 
getEncoder ()Ljava/util/Base64$Encoder;      javax/crypto/SecretKey 
getEncoded ()[B
   ! " # $ java/util/Base64$Encoder encodeToString ([B)Ljava/lang/String;	 & ' ( ) * java/lang/System out Ljava/io/PrintStream;   , - . makeConcatWithConstants &(Ljava/lang/String;)Ljava/lang/String;
 0 1 2 3 4 java/io/PrintStream println (Ljava/lang/String;)V 6 .pl/gabgal/submanager/backend/util/KeyGenerator Code LineNumberTable LocalVariableTable this 0Lpl/gabgal/submanager/backend/util/KeyGenerator; main ([Ljava/lang/String;)V args [Ljava/lang/String; key Ljavax/crypto/SecretKey; 	base64Key Ljava/lang/String; MethodParameters 
SourceFile KeyGenerator.java BootstrapMethods I Generated key:  K
 L M N - O $java/lang/invoke/StringConcatFactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/invoke/CallSite; InnerClasses Encoder S %java/lang/invoke/MethodHandles$Lookup U java/lang/invoke/MethodHandles Lookup ! 5           7   /     *     8        9        : ;   	 < =  7   k     !  
L +   M %, +   /    8         	  
    9        ! > ?     @ A   
 B C  D    >    E    F G     J  H P        Q 	 R T V 
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/validator/EnumValid.class`

```
   A #  0pl/gabgal/submanager/backend/validator/EnumValid  java/lang/Object  java/lang/annotation/Annotation 	enumClass ()Ljava/lang/Class; 	Signature )()Ljava/lang/Class<+Ljava/lang/Enum<*>;>; message ()Ljava/lang/String; AnnotationDefault )Invalid value. Must be one of {enumClass} groups ()[Ljava/lang/Class; ()[Ljava/lang/Class<*>; payload 3()[Ljava/lang/Class<+Ljakarta/validation/Payload;>; 
SourceFile EnumValid.java RuntimeVisibleAnnotations !Ljava/lang/annotation/Documented; Ljakarta/validation/Constraint; validatedBy 6Lpl/gabgal/submanager/backend/validator/EnumValidImpl; Ljava/lang/annotation/Target; value "Ljava/lang/annotation/ElementType; FIELD 	PARAMETER  Ljava/lang/annotation/Retention; &Ljava/lang/annotation/RetentionPolicy; RUNTIME&           	    
    
   s     
   [   	        
   [   	              0       [ c    [ e  e      e ! "
```

--- 

## `sub-manager-backend/target/classes/pl/gabgal/submanager/backend/validator/EnumValidImpl.class`

```
   A m
      java/lang/Object <init> ()V  	 
   0pl/gabgal/submanager/backend/validator/EnumValid 	enumClass ()Ljava/lang/Class;
      java/lang/Class getEnumConstants ()[Ljava/lang/Object;  [Ljava/lang/Enum;	      4pl/gabgal/submanager/backend/validator/EnumValidImpl 
enumValues
      java/util/Arrays stream .([Ljava/lang/Object;)Ljava/util/stream/Stream;   ! " # test 2(Ljava/lang/String;)Ljava/util/function/Predicate; % & ' ( ) java/util/stream/Stream anyMatch !(Ljava/util/function/Predicate;)Z + java/lang/String
  - . / isValid D(Ljava/lang/String;Ljakarta/validation/ConstraintValidatorContext;)Z
  1 2 3 
initialize 5(Lpl/gabgal/submanager/backend/validator/EnumValid;)V
 5 6 7 8 9 java/lang/Enum name ()Ljava/lang/String;
 * ; < = equalsIgnoreCase (Ljava/lang/String;)Z ? &jakarta/validation/ConstraintValidator 	Signature [Ljava/lang/Enum<*>; Code LineNumberTable LocalVariableTable this 6Lpl/gabgal/submanager/backend/validator/EnumValidImpl; 
annotation 2Lpl/gabgal/submanager/backend/validator/EnumValid; MethodParameters value Ljava/lang/String; context /Ljakarta/validation/ConstraintValidatorContext; 
StackMapTable D(Ljava/lang/Object;Ljakarta/validation/ConstraintValidatorContext;)Z $(Ljava/lang/annotation/Annotation;)V lambda$isValid$0 %(Ljava/lang/String;Ljava/lang/Enum;)Z e Ljava/lang/Enum; Ljava/lang/Object;Ljakarta/validation/ConstraintValidator<Lpl/gabgal/submanager/backend/validator/EnumValid;Ljava/lang/String;>; 
SourceFile EnumValidImpl.java BootstrapMethods Z (Ljava/lang/Object;)Z \
  ] Q R _ (Ljava/lang/Enum;)Z a
 b c d e f "java/lang/invoke/LambdaMetafactory metafactory (Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invoke/MethodType;)Ljava/lang/invoke/CallSite; InnerClasses i %java/lang/invoke/MethodHandles$Lookup k java/lang/invoke/MethodHandles Lookup !    >      @    A      B   /     *     C        D        E F    2 3  B   I     *+   
      C   
      
 D        E F      G H  I    G    . /  B   l     + *  +     $     C              D         E F      J K     L M  N     I   	 J   L  A . O  B   4     
*+ *, ,    C        D       
 E F   I   	 J  L A 2 P  B   3     	*+  0    C        D       	 E F   I    G 
 Q R  B   =     	+ 4* :    C        D       	 J K     	 S T   @    U V    W X     `  Y [ ^ g   
  h j l 
```

--- 

## `sub-manager-backend/target/maven-status/maven-compiler-plugin/compile/default-compile/createdFiles.lst`

```
pl/gabgal/submanager/backend/repository/PaymentRepository.class
pl/gabgal/submanager/backend/service/CurrencyService.class
pl/gabgal/submanager/backend/config/ApplicationConfig.class
pl/gabgal/submanager/backend/model/Payment.class
pl/gabgal/submanager/backend/config/CorsConfig.class
pl/gabgal/submanager/backend/config/GlobalExceptionHandler.class
pl/gabgal/submanager/backend/controller/CurrencyController.class
pl/gabgal/submanager/backend/enums/Role.class
pl/gabgal/submanager/backend/dto/SubscriptionCreateRequest.class
pl/gabgal/submanager/backend/config/SecurityConfig.class
pl/gabgal/submanager/backend/dto/ErrorResponse.class
pl/gabgal/submanager/backend/service/AuthService.class
pl/gabgal/submanager/backend/controller/ScheduleController$1.class
pl/gabgal/submanager/backend/dto/PaymentResponse.class
pl/gabgal/submanager/backend/model/Currency$CurrencyBuilder.class
pl/gabgal/submanager/backend/dto/AuthenticationResponse.class
pl/gabgal/submanager/backend/dto/SubscriptionResponse.class
pl/gabgal/submanager/backend/config/JwtAuthFilter.class
pl/gabgal/submanager/backend/model/Subscription$SubscriptionBuilder.class
pl/gabgal/submanager/backend/controller/PaymentsController.class
pl/gabgal/submanager/backend/model/User$UserBuilder.class
pl/gabgal/submanager/backend/model/User.class
pl/gabgal/submanager/backend/repository/SubscriptionRepository.class
pl/gabgal/submanager/backend/service/PaymentService$1.class
pl/gabgal/submanager/backend/model/Currency.class
pl/gabgal/submanager/backend/repository/CurrencyRepository.class
pl/gabgal/submanager/backend/enums/Status.class
pl/gabgal/submanager/backend/util/KeyGenerator.class
pl/gabgal/submanager/backend/model/Subscription.class
pl/gabgal/submanager/backend/enums/Cycle.class
pl/gabgal/submanager/backend/model/Payment$PaymentBuilder.class
pl/gabgal/submanager/backend/service/SubscriptionService.class
pl/gabgal/submanager/backend/service/EmailService.class
pl/gabgal/submanager/backend/controller/AuthController.class
pl/gabgal/submanager/backend/validator/EnumValidImpl.class
pl/gabgal/submanager/backend/SubManagerBackendApplication.class
pl/gabgal/submanager/backend/repository/UserRepository.class
pl/gabgal/submanager/backend/controller/SubscriptionController.class
pl/gabgal/submanager/backend/dto/RegisterRequest.class
pl/gabgal/submanager/backend/controller/TestController.class
pl/gabgal/submanager/backend/service/PaymentService.class
pl/gabgal/submanager/backend/dto/AuthenticationResponse$AuthenticationResponseBuilder.class
pl/gabgal/submanager/backend/enums/Notify.class
pl/gabgal/submanager/backend/service/JwtService.class
pl/gabgal/submanager/backend/controller/ScheduleController.class
pl/gabgal/submanager/backend/dto/LoginRequest.class
pl/gabgal/submanager/backend/validator/EnumValid.class

```

--- 

## `sub-manager-backend/target/maven-status/maven-compiler-plugin/compile/default-compile/inputFiles.lst`

```
/app/src/main/java/pl/gabgal/submanager/backend/SubManagerBackendApplication.java
/app/src/main/java/pl/gabgal/submanager/backend/config/ApplicationConfig.java
/app/src/main/java/pl/gabgal/submanager/backend/config/CorsConfig.java
/app/src/main/java/pl/gabgal/submanager/backend/config/GlobalExceptionHandler.java
/app/src/main/java/pl/gabgal/submanager/backend/config/JwtAuthFilter.java
/app/src/main/java/pl/gabgal/submanager/backend/config/SecurityConfig.java
/app/src/main/java/pl/gabgal/submanager/backend/controller/AuthController.java
/app/src/main/java/pl/gabgal/submanager/backend/controller/CurrencyController.java
/app/src/main/java/pl/gabgal/submanager/backend/controller/PaymentsController.java
/app/src/main/java/pl/gabgal/submanager/backend/controller/ScheduleController.java
/app/src/main/java/pl/gabgal/submanager/backend/controller/SubscriptionController.java
/app/src/main/java/pl/gabgal/submanager/backend/controller/TestController.java
/app/src/main/java/pl/gabgal/submanager/backend/dto/AuthenticationResponse.java
/app/src/main/java/pl/gabgal/submanager/backend/dto/ErrorResponse.java
/app/src/main/java/pl/gabgal/submanager/backend/dto/LoginRequest.java
/app/src/main/java/pl/gabgal/submanager/backend/dto/PaymentResponse.java
/app/src/main/java/pl/gabgal/submanager/backend/dto/RegisterRequest.java
/app/src/main/java/pl/gabgal/submanager/backend/dto/SubscriptionCreateRequest.java
/app/src/main/java/pl/gabgal/submanager/backend/dto/SubscriptionResponse.java
/app/src/main/java/pl/gabgal/submanager/backend/enums/Cycle.java
/app/src/main/java/pl/gabgal/submanager/backend/enums/Notify.java
/app/src/main/java/pl/gabgal/submanager/backend/enums/Role.java
/app/src/main/java/pl/gabgal/submanager/backend/enums/Status.java
/app/src/main/java/pl/gabgal/submanager/backend/model/Currency.java
/app/src/main/java/pl/gabgal/submanager/backend/model/Payment.java
/app/src/main/java/pl/gabgal/submanager/backend/model/Subscription.java
/app/src/main/java/pl/gabgal/submanager/backend/model/User.java
/app/src/main/java/pl/gabgal/submanager/backend/repository/CurrencyRepository.java
/app/src/main/java/pl/gabgal/submanager/backend/repository/PaymentRepository.java
/app/src/main/java/pl/gabgal/submanager/backend/repository/SubscriptionRepository.java
/app/src/main/java/pl/gabgal/submanager/backend/repository/UserRepository.java
/app/src/main/java/pl/gabgal/submanager/backend/service/AuthService.java
/app/src/main/java/pl/gabgal/submanager/backend/service/CurrencyService.java
/app/src/main/java/pl/gabgal/submanager/backend/service/EmailService.java
/app/src/main/java/pl/gabgal/submanager/backend/service/JwtService.java
/app/src/main/java/pl/gabgal/submanager/backend/service/PaymentService.java
/app/src/main/java/pl/gabgal/submanager/backend/service/SubscriptionService.java
/app/src/main/java/pl/gabgal/submanager/backend/util/KeyGenerator.java
/app/src/main/java/pl/gabgal/submanager/backend/validator/EnumValid.java
/app/src/main/java/pl/gabgal/submanager/backend/validator/EnumValidImpl.java

```

--- 

## `sub-manager-backend/target/maven-status/maven-compiler-plugin/testCompile/default-testCompile/createdFiles.lst`

```
pl/gabgal/submanager/backend/SubManagerBackendApplicationTests.class

```

--- 

## `sub-manager-backend/target/maven-status/maven-compiler-plugin/testCompile/default-testCompile/inputFiles.lst`

```
/app/src/test/java/pl/gabgal/submanager/backend/SubManagerBackendApplicationTests.java

```

--- 

## `sub-manager-backend/target/surefire-reports/2025-02-15T14-22-32_929.dumpstream`

```
# Created at 2025-02-15T14:22:33.156
Boot Manifest-JAR contains absolute paths in classpath 'D:\Code\Studia\Inzynierka\sub-manager-backend\target\test-classes'
Hint: <argLine>-Djdk.net.URLClassPath.disableClassPathURLCheck=true</argLine>
'other' has different root


```

--- 

## `sub-manager-backend/target/surefire-reports/pl.gabgal.submanager.backend.SubManagerBackendApplicationTests.txt`

```
-------------------------------------------------------------------------------
Test set: pl.gabgal.submanager.backend.SubManagerBackendApplicationTests
-------------------------------------------------------------------------------
Tests run: 1, Failures: 0, Errors: 1, Skipped: 0, Time elapsed: 4.059 s <<< FAILURE! -- in pl.gabgal.submanager.backend.SubManagerBackendApplicationTests
pl.gabgal.submanager.backend.SubManagerBackendApplicationTests.contextLoads -- Time elapsed: 0.025 s <<< ERROR!
java.lang.IllegalStateException: Failed to load ApplicationContext for [WebMergedContextConfiguration@28831d69 testClass = pl.gabgal.submanager.backend.SubManagerBackendApplicationTests, locations = [], classes = [pl.gabgal.submanager.backend.SubManagerBackendApplication], contextInitializerClasses = [], activeProfiles = [], propertySourceDescriptors = [], propertySourceProperties = ["org.springframework.boot.test.context.SpringBootTestContextBootstrapper=true"], contextCustomizers = [org.springframework.boot.test.context.filter.ExcludeFilterContextCustomizer@32115b28, org.springframework.boot.test.json.DuplicateJsonObjectContextCustomizerFactory$DuplicateJsonObjectContextCustomizer@4b8729ff, org.springframework.boot.test.mock.mockito.MockitoContextCustomizer@0, org.springframework.boot.test.web.client.TestRestTemplateContextCustomizer@9cb8225, org.springframework.boot.test.web.reactor.netty.DisableReactorResourceFactoryGlobalResourcesContextCustomizerFactory$DisableReactorResourceFactoryGlobalResourcesContextCustomizerCustomizer@18ece7f4, org.springframework.boot.test.autoconfigure.OnFailureConditionReportContextCustomizerFactory$OnFailureConditionReportContextCustomizer@33f676f6, org.springframework.boot.test.autoconfigure.actuate.observability.ObservabilityContextCustomizerFactory$DisableObservabilityContextCustomizer@1f, org.springframework.boot.test.autoconfigure.properties.PropertyMappingContextCustomizer@0, org.springframework.boot.test.autoconfigure.web.servlet.WebDriverContextCustomizer@75c56eb9, org.springframework.test.context.support.DynamicPropertiesContextCustomizer@0, org.springframework.boot.test.context.SpringBootTestAnnotation@2545709a], resourceBasePath = "src/main/webapp", contextLoader = org.springframework.boot.test.context.SpringBootContextLoader, parent = null]
	at org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate.loadContext(DefaultCacheAwareContextLoaderDelegate.java:180)
	at org.springframework.test.context.support.DefaultTestContext.getApplicationContext(DefaultTestContext.java:130)
	at org.springframework.test.context.web.ServletTestExecutionListener.setUpRequestContextIfNecessary(ServletTestExecutionListener.java:191)
	at org.springframework.test.context.web.ServletTestExecutionListener.prepareTestInstance(ServletTestExecutionListener.java:130)
	at org.springframework.test.context.TestContextManager.prepareTestInstance(TestContextManager.java:260)
	at org.springframework.test.context.junit.jupiter.SpringExtension.postProcessTestInstance(SpringExtension.java:160)
	at java.base/java.util.stream.ForEachOps$ForEachOp$OfRef.accept(ForEachOps.java:184)
	at java.base/java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:215)
	at java.base/java.util.stream.ReferencePipeline$2$1.accept(ReferencePipeline.java:197)
	at java.base/java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:215)
	at java.base/java.util.ArrayList$ArrayListSpliterator.forEachRemaining(ArrayList.java:1709)
	at java.base/java.util.stream.AbstractPipeline.copyInto(AbstractPipeline.java:570)
	at java.base/java.util.stream.AbstractPipeline.wrapAndCopyInto(AbstractPipeline.java:560)
	at java.base/java.util.stream.ForEachOps$ForEachOp.evaluateSequential(ForEachOps.java:151)
	at java.base/java.util.stream.ForEachOps$ForEachOp$OfRef.evaluateSequential(ForEachOps.java:174)
	at java.base/java.util.stream.AbstractPipeline.evaluate(AbstractPipeline.java:265)
	at java.base/java.util.stream.ReferencePipeline.forEach(ReferencePipeline.java:636)
	at java.base/java.util.Optional.orElseGet(Optional.java:364)
	at java.base/java.util.ArrayList.forEach(ArrayList.java:1597)
	at java.base/java.util.ArrayList.forEach(ArrayList.java:1597)
Caused by: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'entityManagerFactory' defined in class path resource [org/springframework/boot/autoconfigure/orm/jpa/HibernateJpaConfiguration.class]: Unable to create requested service [org.hibernate.engine.jdbc.env.spi.JdbcEnvironment] due to: Unable to determine Dialect without JDBC metadata (please set 'jakarta.persistence.jdbc.url' for common cases or 'hibernate.dialect' when a custom Dialect implementation must be provided)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1812)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:601)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:523)
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:336)
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:307)
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:334)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:204)
	at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:970)
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:627)
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:752)
	at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:439)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:318)
	at org.springframework.boot.test.context.SpringBootContextLoader.lambda$loadContext$3(SpringBootContextLoader.java:137)
	at org.springframework.util.function.ThrowingSupplier.get(ThrowingSupplier.java:58)
	at org.springframework.util.function.ThrowingSupplier.get(ThrowingSupplier.java:46)
	at org.springframework.boot.SpringApplication.withHook(SpringApplication.java:1461)
	at org.springframework.boot.test.context.SpringBootContextLoader$ContextLoaderHook.run(SpringBootContextLoader.java:553)
	at org.springframework.boot.test.context.SpringBootContextLoader.loadContext(SpringBootContextLoader.java:137)
	at org.springframework.boot.test.context.SpringBootContextLoader.loadContext(SpringBootContextLoader.java:108)
	at org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate.loadContextInternal(DefaultCacheAwareContextLoaderDelegate.java:225)
	at org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate.loadContext(DefaultCacheAwareContextLoaderDelegate.java:152)
	... 19 more
Caused by: org.hibernate.service.spi.ServiceException: Unable to create requested service [org.hibernate.engine.jdbc.env.spi.JdbcEnvironment] due to: Unable to determine Dialect without JDBC metadata (please set 'jakarta.persistence.jdbc.url' for common cases or 'hibernate.dialect' when a custom Dialect implementation must be provided)
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.createService(AbstractServiceRegistryImpl.java:276)
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.initializeService(AbstractServiceRegistryImpl.java:238)
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.getService(AbstractServiceRegistryImpl.java:215)
	at org.hibernate.boot.model.relational.Database.<init>(Database.java:45)
	at org.hibernate.boot.internal.InFlightMetadataCollectorImpl.getDatabase(InFlightMetadataCollectorImpl.java:226)
	at org.hibernate.boot.internal.InFlightMetadataCollectorImpl.<init>(InFlightMetadataCollectorImpl.java:194)
	at org.hibernate.boot.model.process.spi.MetadataBuildingProcess.complete(MetadataBuildingProcess.java:171)
	at org.hibernate.jpa.boot.internal.EntityManagerFactoryBuilderImpl.metadata(EntityManagerFactoryBuilderImpl.java:1431)
	at org.hibernate.jpa.boot.internal.EntityManagerFactoryBuilderImpl.build(EntityManagerFactoryBuilderImpl.java:1502)
	at org.springframework.orm.jpa.vendor.SpringHibernateJpaPersistenceProvider.createContainerEntityManagerFactory(SpringHibernateJpaPersistenceProvider.java:66)
	at org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean.createNativeEntityManagerFactory(LocalContainerEntityManagerFactoryBean.java:390)
	at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.buildNativeEntityManagerFactory(AbstractEntityManagerFactoryBean.java:419)
	at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.afterPropertiesSet(AbstractEntityManagerFactoryBean.java:400)
	at org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean.afterPropertiesSet(LocalContainerEntityManagerFactoryBean.java:366)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.invokeInitMethods(AbstractAutowireCapableBeanFactory.java:1859)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1808)
	... 39 more
Caused by: org.hibernate.HibernateException: Unable to determine Dialect without JDBC metadata (please set 'jakarta.persistence.jdbc.url' for common cases or 'hibernate.dialect' when a custom Dialect implementation must be provided)
	at org.hibernate.engine.jdbc.dialect.internal.DialectFactoryImpl.determineDialect(DialectFactoryImpl.java:191)
	at org.hibernate.engine.jdbc.dialect.internal.DialectFactoryImpl.buildDialect(DialectFactoryImpl.java:87)
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.getJdbcEnvironmentWithDefaults(JdbcEnvironmentInitiator.java:181)
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.getJdbcEnvironmentUsingJdbcMetadata(JdbcEnvironmentInitiator.java:392)
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.initiateService(JdbcEnvironmentInitiator.java:129)
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.initiateService(JdbcEnvironmentInitiator.java:81)
	at org.hibernate.boot.registry.internal.StandardServiceRegistryImpl.initiateService(StandardServiceRegistryImpl.java:130)
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.createService(AbstractServiceRegistryImpl.java:263)
	... 54 more


```

--- 

## `sub-manager-backend/target/surefire-reports/TEST-pl.gabgal.submanager.backend.SubManagerBackendApplicationTests.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuite xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://maven.apache.org/surefire/maven-surefire-plugin/xsd/surefire-test-report.xsd" version="3.0.2" name="pl.gabgal.submanager.backend.SubManagerBackendApplicationTests" time="4.059" tests="1" errors="1" skipped="0" failures="0">
  <properties>
    <property name="java.specification.version" value="23"/>
    <property name="sun.cpu.isalist" value="amd64"/>
    <property name="sun.jnu.encoding" value="Cp1250"/>
    <property name="java.class.path" value="D:\Code\Studia\Inzynierka\sub-manager-backend\target\test-classes;D:\Code\Studia\Inzynierka\sub-manager-backend\target\classes;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter-web\3.4.2\spring-boot-starter-web-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter\3.4.2\spring-boot-starter-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter-logging\3.4.2\spring-boot-starter-logging-3.4.2.jar;C:\Users\Vigz\.m2\repository\ch\qos\logback\logback-classic\1.5.16\logback-classic-1.5.16.jar;C:\Users\Vigz\.m2\repository\ch\qos\logback\logback-core\1.5.16\logback-core-1.5.16.jar;C:\Users\Vigz\.m2\repository\org\apache\logging\log4j\log4j-to-slf4j\2.24.3\log4j-to-slf4j-2.24.3.jar;C:\Users\Vigz\.m2\repository\org\apache\logging\log4j\log4j-api\2.24.3\log4j-api-2.24.3.jar;C:\Users\Vigz\.m2\repository\org\slf4j\jul-to-slf4j\2.0.16\jul-to-slf4j-2.0.16.jar;C:\Users\Vigz\.m2\repository\jakarta\annotation\jakarta.annotation-api\2.1.1\jakarta.annotation-api-2.1.1.jar;C:\Users\Vigz\.m2\repository\org\yaml\snakeyaml\2.3\snakeyaml-2.3.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter-json\3.4.2\spring-boot-starter-json-3.4.2.jar;C:\Users\Vigz\.m2\repository\com\fasterxml\jackson\datatype\jackson-datatype-jdk8\2.18.2\jackson-datatype-jdk8-2.18.2.jar;C:\Users\Vigz\.m2\repository\com\fasterxml\jackson\datatype\jackson-datatype-jsr310\2.18.2\jackson-datatype-jsr310-2.18.2.jar;C:\Users\Vigz\.m2\repository\com\fasterxml\jackson\module\jackson-module-parameter-names\2.18.2\jackson-module-parameter-names-2.18.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter-tomcat\3.4.2\spring-boot-starter-tomcat-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\apache\tomcat\embed\tomcat-embed-core\10.1.34\tomcat-embed-core-10.1.34.jar;C:\Users\Vigz\.m2\repository\org\apache\tomcat\embed\tomcat-embed-websocket\10.1.34\tomcat-embed-websocket-10.1.34.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-web\6.2.2\spring-web-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-beans\6.2.2\spring-beans-6.2.2.jar;C:\Users\Vigz\.m2\repository\io\micrometer\micrometer-observation\1.14.3\micrometer-observation-1.14.3.jar;C:\Users\Vigz\.m2\repository\io\micrometer\micrometer-commons\1.14.3\micrometer-commons-1.14.3.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-webmvc\6.2.2\spring-webmvc-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-context\6.2.2\spring-context-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-expression\6.2.2\spring-expression-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter-data-jpa\3.4.2\spring-boot-starter-data-jpa-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter-jdbc\3.4.2\spring-boot-starter-jdbc-3.4.2.jar;C:\Users\Vigz\.m2\repository\com\zaxxer\HikariCP\5.1.0\HikariCP-5.1.0.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-jdbc\6.2.2\spring-jdbc-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\hibernate\orm\hibernate-core\6.6.5.Final\hibernate-core-6.6.5.Final.jar;C:\Users\Vigz\.m2\repository\jakarta\persistence\jakarta.persistence-api\3.1.0\jakarta.persistence-api-3.1.0.jar;C:\Users\Vigz\.m2\repository\jakarta\transaction\jakarta.transaction-api\2.0.1\jakarta.transaction-api-2.0.1.jar;C:\Users\Vigz\.m2\repository\org\jboss\logging\jboss-logging\3.6.1.Final\jboss-logging-3.6.1.Final.jar;C:\Users\Vigz\.m2\repository\org\hibernate\common\hibernate-commons-annotations\7.0.3.Final\hibernate-commons-annotations-7.0.3.Final.jar;C:\Users\Vigz\.m2\repository\io\smallrye\jandex\3.2.0\jandex-3.2.0.jar;C:\Users\Vigz\.m2\repository\com\fasterxml\classmate\1.7.0\classmate-1.7.0.jar;C:\Users\Vigz\.m2\repository\net\bytebuddy\byte-buddy\1.15.11\byte-buddy-1.15.11.jar;C:\Users\Vigz\.m2\repository\org\glassfish\jaxb\jaxb-runtime\4.0.5\jaxb-runtime-4.0.5.jar;C:\Users\Vigz\.m2\repository\org\glassfish\jaxb\jaxb-core\4.0.5\jaxb-core-4.0.5.jar;C:\Users\Vigz\.m2\repository\org\eclipse\angus\angus-activation\2.0.2\angus-activation-2.0.2.jar;C:\Users\Vigz\.m2\repository\org\glassfish\jaxb\txw2\4.0.5\txw2-4.0.5.jar;C:\Users\Vigz\.m2\repository\com\sun\istack\istack-commons-runtime\4.1.2\istack-commons-runtime-4.1.2.jar;C:\Users\Vigz\.m2\repository\jakarta\inject\jakarta.inject-api\2.0.1\jakarta.inject-api-2.0.1.jar;C:\Users\Vigz\.m2\repository\org\antlr\antlr4-runtime\4.13.0\antlr4-runtime-4.13.0.jar;C:\Users\Vigz\.m2\repository\org\springframework\data\spring-data-jpa\3.4.2\spring-data-jpa-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\data\spring-data-commons\3.4.2\spring-data-commons-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-orm\6.2.2\spring-orm-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-tx\6.2.2\spring-tx-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\slf4j\slf4j-api\2.0.16\slf4j-api-2.0.16.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-aspects\6.2.2\spring-aspects-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\aspectj\aspectjweaver\1.9.22.1\aspectjweaver-1.9.22.1.jar;C:\Users\Vigz\.m2\repository\org\postgresql\postgresql\42.7.5\postgresql-42.7.5.jar;C:\Users\Vigz\.m2\repository\org\checkerframework\checker-qual\3.48.3\checker-qual-3.48.3.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-devtools\3.4.2\spring-boot-devtools-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot\3.4.2\spring-boot-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-autoconfigure\3.4.2\spring-boot-autoconfigure-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter-test\3.4.2\spring-boot-starter-test-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-test\3.4.2\spring-boot-test-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-test-autoconfigure\3.4.2\spring-boot-test-autoconfigure-3.4.2.jar;C:\Users\Vigz\.m2\repository\com\jayway\jsonpath\json-path\2.9.0\json-path-2.9.0.jar;C:\Users\Vigz\.m2\repository\jakarta\xml\bind\jakarta.xml.bind-api\4.0.2\jakarta.xml.bind-api-4.0.2.jar;C:\Users\Vigz\.m2\repository\jakarta\activation\jakarta.activation-api\2.1.3\jakarta.activation-api-2.1.3.jar;C:\Users\Vigz\.m2\repository\net\minidev\json-smart\2.5.1\json-smart-2.5.1.jar;C:\Users\Vigz\.m2\repository\net\minidev\accessors-smart\2.5.1\accessors-smart-2.5.1.jar;C:\Users\Vigz\.m2\repository\org\ow2\asm\asm\9.6\asm-9.6.jar;C:\Users\Vigz\.m2\repository\org\assertj\assertj-core\3.26.3\assertj-core-3.26.3.jar;C:\Users\Vigz\.m2\repository\org\awaitility\awaitility\4.2.2\awaitility-4.2.2.jar;C:\Users\Vigz\.m2\repository\org\hamcrest\hamcrest\2.2\hamcrest-2.2.jar;C:\Users\Vigz\.m2\repository\org\junit\jupiter\junit-jupiter\5.11.4\junit-jupiter-5.11.4.jar;C:\Users\Vigz\.m2\repository\org\junit\jupiter\junit-jupiter-api\5.11.4\junit-jupiter-api-5.11.4.jar;C:\Users\Vigz\.m2\repository\org\opentest4j\opentest4j\1.3.0\opentest4j-1.3.0.jar;C:\Users\Vigz\.m2\repository\org\junit\platform\junit-platform-commons\1.11.4\junit-platform-commons-1.11.4.jar;C:\Users\Vigz\.m2\repository\org\apiguardian\apiguardian-api\1.1.2\apiguardian-api-1.1.2.jar;C:\Users\Vigz\.m2\repository\org\junit\jupiter\junit-jupiter-params\5.11.4\junit-jupiter-params-5.11.4.jar;C:\Users\Vigz\.m2\repository\org\junit\jupiter\junit-jupiter-engine\5.11.4\junit-jupiter-engine-5.11.4.jar;C:\Users\Vigz\.m2\repository\org\junit\platform\junit-platform-engine\1.11.4\junit-platform-engine-1.11.4.jar;C:\Users\Vigz\.m2\repository\org\mockito\mockito-core\5.14.2\mockito-core-5.14.2.jar;C:\Users\Vigz\.m2\repository\net\bytebuddy\byte-buddy-agent\1.15.11\byte-buddy-agent-1.15.11.jar;C:\Users\Vigz\.m2\repository\org\objenesis\objenesis\3.3\objenesis-3.3.jar;C:\Users\Vigz\.m2\repository\org\mockito\mockito-junit-jupiter\5.14.2\mockito-junit-jupiter-5.14.2.jar;C:\Users\Vigz\.m2\repository\org\skyscreamer\jsonassert\1.5.3\jsonassert-1.5.3.jar;C:\Users\Vigz\.m2\repository\com\vaadin\external\google\android-json\0.0.20131108.vaadin1\android-json-0.0.20131108.vaadin1.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-core\6.2.2\spring-core-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-jcl\6.2.2\spring-jcl-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-test\6.2.2\spring-test-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\xmlunit\xmlunit-core\2.10.0\xmlunit-core-2.10.0.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter-validation\3.4.2\spring-boot-starter-validation-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\apache\tomcat\embed\tomcat-embed-el\10.1.34\tomcat-embed-el-10.1.34.jar;C:\Users\Vigz\.m2\repository\org\hibernate\validator\hibernate-validator\8.0.2.Final\hibernate-validator-8.0.2.Final.jar;C:\Users\Vigz\.m2\repository\jakarta\validation\jakarta.validation-api\3.0.2\jakarta.validation-api-3.0.2.jar;C:\Users\Vigz\.m2\repository\org\projectlombok\lombok\1.18.36\lombok-1.18.36.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter-security\3.4.2\spring-boot-starter-security-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-aop\6.2.2\spring-aop-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\security\spring-security-config\6.4.2\spring-security-config-6.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\security\spring-security-web\6.4.2\spring-security-web-6.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\security\spring-security-test\6.4.2\spring-security-test-6.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\security\spring-security-core\6.4.2\spring-security-core-6.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\security\spring-security-crypto\6.4.2\spring-security-crypto-6.4.2.jar;C:\Users\Vigz\.m2\repository\io\jsonwebtoken\jjwt-api\0.11.5\jjwt-api-0.11.5.jar;C:\Users\Vigz\.m2\repository\io\jsonwebtoken\jjwt-impl\0.11.5\jjwt-impl-0.11.5.jar;C:\Users\Vigz\.m2\repository\io\jsonwebtoken\jjwt-jackson\0.11.5\jjwt-jackson-0.11.5.jar;C:\Users\Vigz\.m2\repository\com\fasterxml\jackson\core\jackson-databind\2.18.2\jackson-databind-2.18.2.jar;C:\Users\Vigz\.m2\repository\com\fasterxml\jackson\core\jackson-annotations\2.18.2\jackson-annotations-2.18.2.jar;C:\Users\Vigz\.m2\repository\com\fasterxml\jackson\core\jackson-core\2.18.2\jackson-core-2.18.2.jar;"/>
    <property name="java.vm.vendor" value="Oracle Corporation"/>
    <property name="sun.arch.data.model" value="64"/>
    <property name="user.variant" value=""/>
    <property name="java.vendor.url" value="https://java.oracle.com/"/>
    <property name="user.timezone" value="Europe/Warsaw"/>
    <property name="org.jboss.logging.provider" value="slf4j"/>
    <property name="os.name" value="Windows 10"/>
    <property name="java.vm.specification.version" value="23"/>
    <property name="APPLICATION_NAME" value="sub-manager-backend"/>
    <property name="sun.java.launcher" value="SUN_STANDARD"/>
    <property name="user.country" value="PL"/>
    <property name="sun.boot.library.path" value="C:\Program Files\Java\jdk-23\bin"/>
    <property name="sun.java.command" value="C:\Users\Vigz\AppData\Local\Temp\surefire12433661662455860610\surefirebooter-20250215142233103_3.jar C:\Users\Vigz\AppData\Local\Temp\surefire12433661662455860610 2025-02-15T14-22-32_929-jvmRun1 surefire-20250215142233103_1tmp surefire_0-20250215142233103_2tmp"/>
    <property name="jdk.debug" value="release"/>
    <property name="surefire.test.class.path" value="D:\Code\Studia\Inzynierka\sub-manager-backend\target\test-classes;D:\Code\Studia\Inzynierka\sub-manager-backend\target\classes;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter-web\3.4.2\spring-boot-starter-web-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter\3.4.2\spring-boot-starter-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter-logging\3.4.2\spring-boot-starter-logging-3.4.2.jar;C:\Users\Vigz\.m2\repository\ch\qos\logback\logback-classic\1.5.16\logback-classic-1.5.16.jar;C:\Users\Vigz\.m2\repository\ch\qos\logback\logback-core\1.5.16\logback-core-1.5.16.jar;C:\Users\Vigz\.m2\repository\org\apache\logging\log4j\log4j-to-slf4j\2.24.3\log4j-to-slf4j-2.24.3.jar;C:\Users\Vigz\.m2\repository\org\apache\logging\log4j\log4j-api\2.24.3\log4j-api-2.24.3.jar;C:\Users\Vigz\.m2\repository\org\slf4j\jul-to-slf4j\2.0.16\jul-to-slf4j-2.0.16.jar;C:\Users\Vigz\.m2\repository\jakarta\annotation\jakarta.annotation-api\2.1.1\jakarta.annotation-api-2.1.1.jar;C:\Users\Vigz\.m2\repository\org\yaml\snakeyaml\2.3\snakeyaml-2.3.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter-json\3.4.2\spring-boot-starter-json-3.4.2.jar;C:\Users\Vigz\.m2\repository\com\fasterxml\jackson\datatype\jackson-datatype-jdk8\2.18.2\jackson-datatype-jdk8-2.18.2.jar;C:\Users\Vigz\.m2\repository\com\fasterxml\jackson\datatype\jackson-datatype-jsr310\2.18.2\jackson-datatype-jsr310-2.18.2.jar;C:\Users\Vigz\.m2\repository\com\fasterxml\jackson\module\jackson-module-parameter-names\2.18.2\jackson-module-parameter-names-2.18.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter-tomcat\3.4.2\spring-boot-starter-tomcat-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\apache\tomcat\embed\tomcat-embed-core\10.1.34\tomcat-embed-core-10.1.34.jar;C:\Users\Vigz\.m2\repository\org\apache\tomcat\embed\tomcat-embed-websocket\10.1.34\tomcat-embed-websocket-10.1.34.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-web\6.2.2\spring-web-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-beans\6.2.2\spring-beans-6.2.2.jar;C:\Users\Vigz\.m2\repository\io\micrometer\micrometer-observation\1.14.3\micrometer-observation-1.14.3.jar;C:\Users\Vigz\.m2\repository\io\micrometer\micrometer-commons\1.14.3\micrometer-commons-1.14.3.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-webmvc\6.2.2\spring-webmvc-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-context\6.2.2\spring-context-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-expression\6.2.2\spring-expression-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter-data-jpa\3.4.2\spring-boot-starter-data-jpa-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter-jdbc\3.4.2\spring-boot-starter-jdbc-3.4.2.jar;C:\Users\Vigz\.m2\repository\com\zaxxer\HikariCP\5.1.0\HikariCP-5.1.0.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-jdbc\6.2.2\spring-jdbc-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\hibernate\orm\hibernate-core\6.6.5.Final\hibernate-core-6.6.5.Final.jar;C:\Users\Vigz\.m2\repository\jakarta\persistence\jakarta.persistence-api\3.1.0\jakarta.persistence-api-3.1.0.jar;C:\Users\Vigz\.m2\repository\jakarta\transaction\jakarta.transaction-api\2.0.1\jakarta.transaction-api-2.0.1.jar;C:\Users\Vigz\.m2\repository\org\jboss\logging\jboss-logging\3.6.1.Final\jboss-logging-3.6.1.Final.jar;C:\Users\Vigz\.m2\repository\org\hibernate\common\hibernate-commons-annotations\7.0.3.Final\hibernate-commons-annotations-7.0.3.Final.jar;C:\Users\Vigz\.m2\repository\io\smallrye\jandex\3.2.0\jandex-3.2.0.jar;C:\Users\Vigz\.m2\repository\com\fasterxml\classmate\1.7.0\classmate-1.7.0.jar;C:\Users\Vigz\.m2\repository\net\bytebuddy\byte-buddy\1.15.11\byte-buddy-1.15.11.jar;C:\Users\Vigz\.m2\repository\org\glassfish\jaxb\jaxb-runtime\4.0.5\jaxb-runtime-4.0.5.jar;C:\Users\Vigz\.m2\repository\org\glassfish\jaxb\jaxb-core\4.0.5\jaxb-core-4.0.5.jar;C:\Users\Vigz\.m2\repository\org\eclipse\angus\angus-activation\2.0.2\angus-activation-2.0.2.jar;C:\Users\Vigz\.m2\repository\org\glassfish\jaxb\txw2\4.0.5\txw2-4.0.5.jar;C:\Users\Vigz\.m2\repository\com\sun\istack\istack-commons-runtime\4.1.2\istack-commons-runtime-4.1.2.jar;C:\Users\Vigz\.m2\repository\jakarta\inject\jakarta.inject-api\2.0.1\jakarta.inject-api-2.0.1.jar;C:\Users\Vigz\.m2\repository\org\antlr\antlr4-runtime\4.13.0\antlr4-runtime-4.13.0.jar;C:\Users\Vigz\.m2\repository\org\springframework\data\spring-data-jpa\3.4.2\spring-data-jpa-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\data\spring-data-commons\3.4.2\spring-data-commons-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-orm\6.2.2\spring-orm-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-tx\6.2.2\spring-tx-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\slf4j\slf4j-api\2.0.16\slf4j-api-2.0.16.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-aspects\6.2.2\spring-aspects-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\aspectj\aspectjweaver\1.9.22.1\aspectjweaver-1.9.22.1.jar;C:\Users\Vigz\.m2\repository\org\postgresql\postgresql\42.7.5\postgresql-42.7.5.jar;C:\Users\Vigz\.m2\repository\org\checkerframework\checker-qual\3.48.3\checker-qual-3.48.3.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-devtools\3.4.2\spring-boot-devtools-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot\3.4.2\spring-boot-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-autoconfigure\3.4.2\spring-boot-autoconfigure-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter-test\3.4.2\spring-boot-starter-test-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-test\3.4.2\spring-boot-test-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-test-autoconfigure\3.4.2\spring-boot-test-autoconfigure-3.4.2.jar;C:\Users\Vigz\.m2\repository\com\jayway\jsonpath\json-path\2.9.0\json-path-2.9.0.jar;C:\Users\Vigz\.m2\repository\jakarta\xml\bind\jakarta.xml.bind-api\4.0.2\jakarta.xml.bind-api-4.0.2.jar;C:\Users\Vigz\.m2\repository\jakarta\activation\jakarta.activation-api\2.1.3\jakarta.activation-api-2.1.3.jar;C:\Users\Vigz\.m2\repository\net\minidev\json-smart\2.5.1\json-smart-2.5.1.jar;C:\Users\Vigz\.m2\repository\net\minidev\accessors-smart\2.5.1\accessors-smart-2.5.1.jar;C:\Users\Vigz\.m2\repository\org\ow2\asm\asm\9.6\asm-9.6.jar;C:\Users\Vigz\.m2\repository\org\assertj\assertj-core\3.26.3\assertj-core-3.26.3.jar;C:\Users\Vigz\.m2\repository\org\awaitility\awaitility\4.2.2\awaitility-4.2.2.jar;C:\Users\Vigz\.m2\repository\org\hamcrest\hamcrest\2.2\hamcrest-2.2.jar;C:\Users\Vigz\.m2\repository\org\junit\jupiter\junit-jupiter\5.11.4\junit-jupiter-5.11.4.jar;C:\Users\Vigz\.m2\repository\org\junit\jupiter\junit-jupiter-api\5.11.4\junit-jupiter-api-5.11.4.jar;C:\Users\Vigz\.m2\repository\org\opentest4j\opentest4j\1.3.0\opentest4j-1.3.0.jar;C:\Users\Vigz\.m2\repository\org\junit\platform\junit-platform-commons\1.11.4\junit-platform-commons-1.11.4.jar;C:\Users\Vigz\.m2\repository\org\apiguardian\apiguardian-api\1.1.2\apiguardian-api-1.1.2.jar;C:\Users\Vigz\.m2\repository\org\junit\jupiter\junit-jupiter-params\5.11.4\junit-jupiter-params-5.11.4.jar;C:\Users\Vigz\.m2\repository\org\junit\jupiter\junit-jupiter-engine\5.11.4\junit-jupiter-engine-5.11.4.jar;C:\Users\Vigz\.m2\repository\org\junit\platform\junit-platform-engine\1.11.4\junit-platform-engine-1.11.4.jar;C:\Users\Vigz\.m2\repository\org\mockito\mockito-core\5.14.2\mockito-core-5.14.2.jar;C:\Users\Vigz\.m2\repository\net\bytebuddy\byte-buddy-agent\1.15.11\byte-buddy-agent-1.15.11.jar;C:\Users\Vigz\.m2\repository\org\objenesis\objenesis\3.3\objenesis-3.3.jar;C:\Users\Vigz\.m2\repository\org\mockito\mockito-junit-jupiter\5.14.2\mockito-junit-jupiter-5.14.2.jar;C:\Users\Vigz\.m2\repository\org\skyscreamer\jsonassert\1.5.3\jsonassert-1.5.3.jar;C:\Users\Vigz\.m2\repository\com\vaadin\external\google\android-json\0.0.20131108.vaadin1\android-json-0.0.20131108.vaadin1.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-core\6.2.2\spring-core-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-jcl\6.2.2\spring-jcl-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-test\6.2.2\spring-test-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\xmlunit\xmlunit-core\2.10.0\xmlunit-core-2.10.0.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter-validation\3.4.2\spring-boot-starter-validation-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\apache\tomcat\embed\tomcat-embed-el\10.1.34\tomcat-embed-el-10.1.34.jar;C:\Users\Vigz\.m2\repository\org\hibernate\validator\hibernate-validator\8.0.2.Final\hibernate-validator-8.0.2.Final.jar;C:\Users\Vigz\.m2\repository\jakarta\validation\jakarta.validation-api\3.0.2\jakarta.validation-api-3.0.2.jar;C:\Users\Vigz\.m2\repository\org\projectlombok\lombok\1.18.36\lombok-1.18.36.jar;C:\Users\Vigz\.m2\repository\org\springframework\boot\spring-boot-starter-security\3.4.2\spring-boot-starter-security-3.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\spring-aop\6.2.2\spring-aop-6.2.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\security\spring-security-config\6.4.2\spring-security-config-6.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\security\spring-security-web\6.4.2\spring-security-web-6.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\security\spring-security-test\6.4.2\spring-security-test-6.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\security\spring-security-core\6.4.2\spring-security-core-6.4.2.jar;C:\Users\Vigz\.m2\repository\org\springframework\security\spring-security-crypto\6.4.2\spring-security-crypto-6.4.2.jar;C:\Users\Vigz\.m2\repository\io\jsonwebtoken\jjwt-api\0.11.5\jjwt-api-0.11.5.jar;C:\Users\Vigz\.m2\repository\io\jsonwebtoken\jjwt-impl\0.11.5\jjwt-impl-0.11.5.jar;C:\Users\Vigz\.m2\repository\io\jsonwebtoken\jjwt-jackson\0.11.5\jjwt-jackson-0.11.5.jar;C:\Users\Vigz\.m2\repository\com\fasterxml\jackson\core\jackson-databind\2.18.2\jackson-databind-2.18.2.jar;C:\Users\Vigz\.m2\repository\com\fasterxml\jackson\core\jackson-annotations\2.18.2\jackson-annotations-2.18.2.jar;C:\Users\Vigz\.m2\repository\com\fasterxml\jackson\core\jackson-core\2.18.2\jackson-core-2.18.2.jar;"/>
    <property name="sun.cpu.endian" value="little"/>
    <property name="user.home" value="C:\Users\Vigz"/>
    <property name="user.language" value="pl"/>
    <property name="java.specification.vendor" value="Oracle Corporation"/>
    <property name="java.version.date" value="2024-10-15"/>
    <property name="java.home" value="C:\Program Files\Java\jdk-23"/>
    <property name="file.separator" value="\"/>
    <property name="basedir" value="D:\Code\Studia\Inzynierka\sub-manager-backend"/>
    <property name="java.vm.compressedOopsMode" value="Zero based"/>
    <property name="line.separator" value="&#10;"/>
    <property name="java.vm.specification.vendor" value="Oracle Corporation"/>
    <property name="java.specification.name" value="Java Platform API Specification"/>
    <property name="FILE_LOG_CHARSET" value="UTF-8"/>
    <property name="java.awt.headless" value="true"/>
    <property name="surefire.real.class.path" value="C:\Users\Vigz\AppData\Local\Temp\surefire12433661662455860610\surefirebooter-20250215142233103_3.jar"/>
    <property name="user.script" value=""/>
    <property name="sun.management.compiler" value="HotSpot 64-Bit Tiered Compilers"/>
    <property name="java.runtime.version" value="23.0.1+11-39"/>
    <property name="user.name" value="Vigz"/>
    <property name="stdout.encoding" value="Cp1250"/>
    <property name="path.separator" value=";"/>
    <property name="os.version" value="10.0"/>
    <property name="java.runtime.name" value="Java(TM) SE Runtime Environment"/>
    <property name="file.encoding" value="UTF-8"/>
    <property name="java.vm.name" value="Java HotSpot(TM) 64-Bit Server VM"/>
    <property name="localRepository" value="C:\Users\Vigz\.m2\repository"/>
    <property name="java.vendor.url.bug" value="https://bugreport.java.com/bugreport/"/>
    <property name="java.io.tmpdir" value="C:\Users\Vigz\AppData\Local\Temp\"/>
    <property name="idea.version" value="2024.3.1.1"/>
    <property name="com.zaxxer.hikari.pool_number" value="1"/>
    <property name="java.version" value="23.0.1"/>
    <property name="user.dir" value="D:\Code\Studia\Inzynierka\sub-manager-backend"/>
    <property name="os.arch" value="amd64"/>
    <property name="java.vm.specification.name" value="Java Virtual Machine Specification"/>
    <property name="PID" value="13068"/>
    <property name="sun.os.patch.level" value=""/>
    <property name="CONSOLE_LOG_CHARSET" value="UTF-8"/>
    <property name="native.encoding" value="Cp1250"/>
    <property name="java.library.path" value="C:\Program Files\Java\jdk-23\bin;C:\Windows\Sun\Java\bin;C:\Windows\system32;C:\Windows;C:\Users\Vigz\Desktop\oracleinstant;C:\Program Files\wooting-analog-sdk\;C:\Program Files\Microsoft SQL Server\150\Tools\Binn\;C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\170\Tools\Binn\;C:\Program Files\dotnet\;C:\Program Files\Docker\Docker\resources\bin;C:\Users\Vigz\AppData\Local\Programs\Python\Python312\Scripts\;C:\Users\Vigz\AppData\Local\Programs\Python\Python312\;C:\Users\Vigz\AppData\Local\Programs\Python\Launcher\;C:\Users\Vigz\.cargo\bin;C:\Users\Vigz\AppData\Local\Microsoft\WindowsApps;C:\Users\Vigz\AppData\Local\Programs\Microsoft VS Code\bin;C:\Users\Vigz\AppData\Roaming\npm;C:\ProgramData\mingw64\mingw64\bin;C:\Users\Vigz\go\bin;C:\Users\Vigz\.dotnet\tools;C:\Users\Vigz\AppData\Local\Microsoft\WinGet\Links;C:\Program Files\nodejs;D:\IntelliJ IDEA 2024.3.1.1\bin;;C:\Windows\System32;C:\Program Files\Git\bin;;."/>
    <property name="java.vm.info" value="mixed mode, sharing"/>
    <property name="stderr.encoding" value="Cp1250"/>
    <property name="java.vendor" value="Oracle Corporation"/>
    <property name="java.vm.version" value="23.0.1+11-39"/>
    <property name="sun.io.unicode.encoding" value="UnicodeLittle"/>
    <property name="java.class.version" value="67.0"/>
    <property name="LOGGED_APPLICATION_NAME" value="[sub-manager-backend] "/>
  </properties>
  <testcase name="contextLoads" classname="pl.gabgal.submanager.backend.SubManagerBackendApplicationTests" time="0.025">
    <error message="Failed to load ApplicationContext for [WebMergedContextConfiguration@28831d69 testClass = pl.gabgal.submanager.backend.SubManagerBackendApplicationTests, locations = [], classes = [pl.gabgal.submanager.backend.SubManagerBackendApplication], contextInitializerClasses = [], activeProfiles = [], propertySourceDescriptors = [], propertySourceProperties = [&quot;org.springframework.boot.test.context.SpringBootTestContextBootstrapper=true&quot;], contextCustomizers = [org.springframework.boot.test.context.filter.ExcludeFilterContextCustomizer@32115b28, org.springframework.boot.test.json.DuplicateJsonObjectContextCustomizerFactory$DuplicateJsonObjectContextCustomizer@4b8729ff, org.springframework.boot.test.mock.mockito.MockitoContextCustomizer@0, org.springframework.boot.test.web.client.TestRestTemplateContextCustomizer@9cb8225, org.springframework.boot.test.web.reactor.netty.DisableReactorResourceFactoryGlobalResourcesContextCustomizerFactory$DisableReactorResourceFactoryGlobalResourcesContextCustomizerCustomizer@18ece7f4, org.springframework.boot.test.autoconfigure.OnFailureConditionReportContextCustomizerFactory$OnFailureConditionReportContextCustomizer@33f676f6, org.springframework.boot.test.autoconfigure.actuate.observability.ObservabilityContextCustomizerFactory$DisableObservabilityContextCustomizer@1f, org.springframework.boot.test.autoconfigure.properties.PropertyMappingContextCustomizer@0, org.springframework.boot.test.autoconfigure.web.servlet.WebDriverContextCustomizer@75c56eb9, org.springframework.test.context.support.DynamicPropertiesContextCustomizer@0, org.springframework.boot.test.context.SpringBootTestAnnotation@2545709a], resourceBasePath = &quot;src/main/webapp&quot;, contextLoader = org.springframework.boot.test.context.SpringBootContextLoader, parent = null]" type="java.lang.IllegalStateException"><![CDATA[java.lang.IllegalStateException: Failed to load ApplicationContext for [WebMergedContextConfiguration@28831d69 testClass = pl.gabgal.submanager.backend.SubManagerBackendApplicationTests, locations = [], classes = [pl.gabgal.submanager.backend.SubManagerBackendApplication], contextInitializerClasses = [], activeProfiles = [], propertySourceDescriptors = [], propertySourceProperties = ["org.springframework.boot.test.context.SpringBootTestContextBootstrapper=true"], contextCustomizers = [org.springframework.boot.test.context.filter.ExcludeFilterContextCustomizer@32115b28, org.springframework.boot.test.json.DuplicateJsonObjectContextCustomizerFactory$DuplicateJsonObjectContextCustomizer@4b8729ff, org.springframework.boot.test.mock.mockito.MockitoContextCustomizer@0, org.springframework.boot.test.web.client.TestRestTemplateContextCustomizer@9cb8225, org.springframework.boot.test.web.reactor.netty.DisableReactorResourceFactoryGlobalResourcesContextCustomizerFactory$DisableReactorResourceFactoryGlobalResourcesContextCustomizerCustomizer@18ece7f4, org.springframework.boot.test.autoconfigure.OnFailureConditionReportContextCustomizerFactory$OnFailureConditionReportContextCustomizer@33f676f6, org.springframework.boot.test.autoconfigure.actuate.observability.ObservabilityContextCustomizerFactory$DisableObservabilityContextCustomizer@1f, org.springframework.boot.test.autoconfigure.properties.PropertyMappingContextCustomizer@0, org.springframework.boot.test.autoconfigure.web.servlet.WebDriverContextCustomizer@75c56eb9, org.springframework.test.context.support.DynamicPropertiesContextCustomizer@0, org.springframework.boot.test.context.SpringBootTestAnnotation@2545709a], resourceBasePath = "src/main/webapp", contextLoader = org.springframework.boot.test.context.SpringBootContextLoader, parent = null]
	at org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate.loadContext(DefaultCacheAwareContextLoaderDelegate.java:180)
	at org.springframework.test.context.support.DefaultTestContext.getApplicationContext(DefaultTestContext.java:130)
	at org.springframework.test.context.web.ServletTestExecutionListener.setUpRequestContextIfNecessary(ServletTestExecutionListener.java:191)
	at org.springframework.test.context.web.ServletTestExecutionListener.prepareTestInstance(ServletTestExecutionListener.java:130)
	at org.springframework.test.context.TestContextManager.prepareTestInstance(TestContextManager.java:260)
	at org.springframework.test.context.junit.jupiter.SpringExtension.postProcessTestInstance(SpringExtension.java:160)
	at java.base/java.util.stream.ForEachOps$ForEachOp$OfRef.accept(ForEachOps.java:184)
	at java.base/java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:215)
	at java.base/java.util.stream.ReferencePipeline$2$1.accept(ReferencePipeline.java:197)
	at java.base/java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:215)
	at java.base/java.util.ArrayList$ArrayListSpliterator.forEachRemaining(ArrayList.java:1709)
	at java.base/java.util.stream.AbstractPipeline.copyInto(AbstractPipeline.java:570)
	at java.base/java.util.stream.AbstractPipeline.wrapAndCopyInto(AbstractPipeline.java:560)
	at java.base/java.util.stream.ForEachOps$ForEachOp.evaluateSequential(ForEachOps.java:151)
	at java.base/java.util.stream.ForEachOps$ForEachOp$OfRef.evaluateSequential(ForEachOps.java:174)
	at java.base/java.util.stream.AbstractPipeline.evaluate(AbstractPipeline.java:265)
	at java.base/java.util.stream.ReferencePipeline.forEach(ReferencePipeline.java:636)
	at java.base/java.util.Optional.orElseGet(Optional.java:364)
	at java.base/java.util.ArrayList.forEach(ArrayList.java:1597)
	at java.base/java.util.ArrayList.forEach(ArrayList.java:1597)
Caused by: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'entityManagerFactory' defined in class path resource [org/springframework/boot/autoconfigure/orm/jpa/HibernateJpaConfiguration.class]: Unable to create requested service [org.hibernate.engine.jdbc.env.spi.JdbcEnvironment] due to: Unable to determine Dialect without JDBC metadata (please set 'jakarta.persistence.jdbc.url' for common cases or 'hibernate.dialect' when a custom Dialect implementation must be provided)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1812)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:601)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:523)
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:336)
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:307)
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:334)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:204)
	at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:970)
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:627)
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:752)
	at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:439)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:318)
	at org.springframework.boot.test.context.SpringBootContextLoader.lambda$loadContext$3(SpringBootContextLoader.java:137)
	at org.springframework.util.function.ThrowingSupplier.get(ThrowingSupplier.java:58)
	at org.springframework.util.function.ThrowingSupplier.get(ThrowingSupplier.java:46)
	at org.springframework.boot.SpringApplication.withHook(SpringApplication.java:1461)
	at org.springframework.boot.test.context.SpringBootContextLoader$ContextLoaderHook.run(SpringBootContextLoader.java:553)
	at org.springframework.boot.test.context.SpringBootContextLoader.loadContext(SpringBootContextLoader.java:137)
	at org.springframework.boot.test.context.SpringBootContextLoader.loadContext(SpringBootContextLoader.java:108)
	at org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate.loadContextInternal(DefaultCacheAwareContextLoaderDelegate.java:225)
	at org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate.loadContext(DefaultCacheAwareContextLoaderDelegate.java:152)
	... 19 more
Caused by: org.hibernate.service.spi.ServiceException: Unable to create requested service [org.hibernate.engine.jdbc.env.spi.JdbcEnvironment] due to: Unable to determine Dialect without JDBC metadata (please set 'jakarta.persistence.jdbc.url' for common cases or 'hibernate.dialect' when a custom Dialect implementation must be provided)
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.createService(AbstractServiceRegistryImpl.java:276)
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.initializeService(AbstractServiceRegistryImpl.java:238)
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.getService(AbstractServiceRegistryImpl.java:215)
	at org.hibernate.boot.model.relational.Database.<init>(Database.java:45)
	at org.hibernate.boot.internal.InFlightMetadataCollectorImpl.getDatabase(InFlightMetadataCollectorImpl.java:226)
	at org.hibernate.boot.internal.InFlightMetadataCollectorImpl.<init>(InFlightMetadataCollectorImpl.java:194)
	at org.hibernate.boot.model.process.spi.MetadataBuildingProcess.complete(MetadataBuildingProcess.java:171)
	at org.hibernate.jpa.boot.internal.EntityManagerFactoryBuilderImpl.metadata(EntityManagerFactoryBuilderImpl.java:1431)
	at org.hibernate.jpa.boot.internal.EntityManagerFactoryBuilderImpl.build(EntityManagerFactoryBuilderImpl.java:1502)
	at org.springframework.orm.jpa.vendor.SpringHibernateJpaPersistenceProvider.createContainerEntityManagerFactory(SpringHibernateJpaPersistenceProvider.java:66)
	at org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean.createNativeEntityManagerFactory(LocalContainerEntityManagerFactoryBean.java:390)
	at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.buildNativeEntityManagerFactory(AbstractEntityManagerFactoryBean.java:419)
	at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.afterPropertiesSet(AbstractEntityManagerFactoryBean.java:400)
	at org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean.afterPropertiesSet(LocalContainerEntityManagerFactoryBean.java:366)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.invokeInitMethods(AbstractAutowireCapableBeanFactory.java:1859)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1808)
	... 39 more
Caused by: org.hibernate.HibernateException: Unable to determine Dialect without JDBC metadata (please set 'jakarta.persistence.jdbc.url' for common cases or 'hibernate.dialect' when a custom Dialect implementation must be provided)
	at org.hibernate.engine.jdbc.dialect.internal.DialectFactoryImpl.determineDialect(DialectFactoryImpl.java:191)
	at org.hibernate.engine.jdbc.dialect.internal.DialectFactoryImpl.buildDialect(DialectFactoryImpl.java:87)
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.getJdbcEnvironmentWithDefaults(JdbcEnvironmentInitiator.java:181)
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.getJdbcEnvironmentUsingJdbcMetadata(JdbcEnvironmentInitiator.java:392)
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.initiateService(JdbcEnvironmentInitiator.java:129)
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.initiateService(JdbcEnvironmentInitiator.java:81)
	at org.hibernate.boot.registry.internal.StandardServiceRegistryImpl.initiateService(StandardServiceRegistryImpl.java:130)
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.createService(AbstractServiceRegistryImpl.java:263)
	... 54 more
]]></error>
    <system-out><![CDATA[14:22:34.147 [main] INFO org.springframework.test.context.support.AnnotationConfigContextLoaderUtils -- Could not detect default configuration classes for test class [pl.gabgal.submanager.backend.SubManagerBackendApplicationTests]: SubManagerBackendApplicationTests does not declare any static, non-private, non-final, nested classes annotated with @Configuration.
14:22:34.302 [main] INFO org.springframework.boot.test.context.SpringBootTestContextBootstrapper -- Found @SpringBootConfiguration pl.gabgal.submanager.backend.SubManagerBackendApplication for test class pl.gabgal.submanager.backend.SubManagerBackendApplicationTests
14:22:34.498 [main] INFO org.springframework.boot.devtools.restart.RestartApplicationListener -- Restart disabled due to context in which it is running

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/

 :: Spring Boot ::                (v3.4.2)

2025-02-15T14:22:34.969+01:00  INFO 13068 --- [sub-manager-backend] [           main] .g.s.b.SubManagerBackendApplicationTests : Starting SubManagerBackendApplicationTests using Java 23.0.1 with PID 13068 (started by Vigz in D:\Code\Studia\Inzynierka\sub-manager-backend)
2025-02-15T14:22:34.970+01:00  INFO 13068 --- [sub-manager-backend] [           main] .g.s.b.SubManagerBackendApplicationTests : No active profile set, falling back to 1 default profile: "default"
2025-02-15T14:22:36.158+01:00  INFO 13068 --- [sub-manager-backend] [           main] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JPA repositories in DEFAULT mode.
2025-02-15T14:22:36.244+01:00  INFO 13068 --- [sub-manager-backend] [           main] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 73 ms. Found 2 JPA repository interfaces.
2025-02-15T14:22:37.031+01:00  INFO 13068 --- [sub-manager-backend] [           main] o.hibernate.jpa.internal.util.LogHelper  : HHH000204: Processing PersistenceUnitInfo [name: default]
2025-02-15T14:22:37.129+01:00  INFO 13068 --- [sub-manager-backend] [           main] org.hibernate.Version                    : HHH000412: Hibernate ORM core version 6.6.5.Final
2025-02-15T14:22:37.201+01:00  INFO 13068 --- [sub-manager-backend] [           main] o.h.c.internal.RegionFactoryInitiator    : HHH000026: Second-level cache disabled
2025-02-15T14:22:37.761+01:00  INFO 13068 --- [sub-manager-backend] [           main] o.s.o.j.p.SpringPersistenceUnitInfo      : No LoadTimeWeaver setup: ignoring JPA class transformer
2025-02-15T14:22:37.808+01:00  INFO 13068 --- [sub-manager-backend] [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2025-02-15T14:22:37.822+01:00  WARN 13068 --- [sub-manager-backend] [           main] org.postgresql.util.PGPropertyUtil       : JDBC URL invalid port number: ${DB_PORT}
2025-02-15T14:22:37.822+01:00  WARN 13068 --- [sub-manager-backend] [           main] o.h.e.j.e.i.JdbcEnvironmentInitiator     : HHH000342: Could not obtain connection to query metadata

java.lang.RuntimeException: Driver org.postgresql.Driver claims to not accept jdbcUrl, jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
	at com.zaxxer.hikari.util.DriverDataSource.<init>(DriverDataSource.java:109) ~[HikariCP-5.1.0.jar:na]
	at com.zaxxer.hikari.pool.PoolBase.initializeDataSource(PoolBase.java:327) ~[HikariCP-5.1.0.jar:na]
	at com.zaxxer.hikari.pool.PoolBase.<init>(PoolBase.java:113) ~[HikariCP-5.1.0.jar:na]
	at com.zaxxer.hikari.pool.HikariPool.<init>(HikariPool.java:91) ~[HikariCP-5.1.0.jar:na]
	at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:111) ~[HikariCP-5.1.0.jar:na]
	at org.hibernate.engine.jdbc.connections.internal.DatasourceConnectionProviderImpl.getConnection(DatasourceConnectionProviderImpl.java:126) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator$ConnectionProviderJdbcConnectionAccess.obtainConnection(JdbcEnvironmentInitiator.java:467) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.resource.transaction.backend.jdbc.internal.JdbcIsolationDelegate.delegateWork(JdbcIsolationDelegate.java:61) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.getJdbcEnvironmentUsingJdbcMetadata(JdbcEnvironmentInitiator.java:320) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.initiateService(JdbcEnvironmentInitiator.java:129) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.initiateService(JdbcEnvironmentInitiator.java:81) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.boot.registry.internal.StandardServiceRegistryImpl.initiateService(StandardServiceRegistryImpl.java:130) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.createService(AbstractServiceRegistryImpl.java:263) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.initializeService(AbstractServiceRegistryImpl.java:238) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.getService(AbstractServiceRegistryImpl.java:215) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.boot.model.relational.Database.<init>(Database.java:45) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.boot.internal.InFlightMetadataCollectorImpl.getDatabase(InFlightMetadataCollectorImpl.java:226) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.boot.internal.InFlightMetadataCollectorImpl.<init>(InFlightMetadataCollectorImpl.java:194) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.boot.model.process.spi.MetadataBuildingProcess.complete(MetadataBuildingProcess.java:171) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.jpa.boot.internal.EntityManagerFactoryBuilderImpl.metadata(EntityManagerFactoryBuilderImpl.java:1431) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.jpa.boot.internal.EntityManagerFactoryBuilderImpl.build(EntityManagerFactoryBuilderImpl.java:1502) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.springframework.orm.jpa.vendor.SpringHibernateJpaPersistenceProvider.createContainerEntityManagerFactory(SpringHibernateJpaPersistenceProvider.java:66) ~[spring-orm-6.2.2.jar:6.2.2]
	at org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean.createNativeEntityManagerFactory(LocalContainerEntityManagerFactoryBean.java:390) ~[spring-orm-6.2.2.jar:6.2.2]
	at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.buildNativeEntityManagerFactory(AbstractEntityManagerFactoryBean.java:419) ~[spring-orm-6.2.2.jar:6.2.2]
	at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.afterPropertiesSet(AbstractEntityManagerFactoryBean.java:400) ~[spring-orm-6.2.2.jar:6.2.2]
	at org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean.afterPropertiesSet(LocalContainerEntityManagerFactoryBean.java:366) ~[spring-orm-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.invokeInitMethods(AbstractAutowireCapableBeanFactory.java:1859) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1808) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:601) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:523) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:336) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:307) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:334) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:204) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:970) ~[spring-context-6.2.2.jar:6.2.2]
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:627) ~[spring-context-6.2.2.jar:6.2.2]
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:752) ~[spring-boot-3.4.2.jar:3.4.2]
	at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:439) ~[spring-boot-3.4.2.jar:3.4.2]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:318) ~[spring-boot-3.4.2.jar:3.4.2]
	at org.springframework.boot.test.context.SpringBootContextLoader.lambda$loadContext$3(SpringBootContextLoader.java:137) ~[spring-boot-test-3.4.2.jar:3.4.2]
	at org.springframework.util.function.ThrowingSupplier.get(ThrowingSupplier.java:58) ~[spring-core-6.2.2.jar:6.2.2]
	at org.springframework.util.function.ThrowingSupplier.get(ThrowingSupplier.java:46) ~[spring-core-6.2.2.jar:6.2.2]
	at org.springframework.boot.SpringApplication.withHook(SpringApplication.java:1461) ~[spring-boot-3.4.2.jar:3.4.2]
	at org.springframework.boot.test.context.SpringBootContextLoader$ContextLoaderHook.run(SpringBootContextLoader.java:553) ~[spring-boot-test-3.4.2.jar:3.4.2]
	at org.springframework.boot.test.context.SpringBootContextLoader.loadContext(SpringBootContextLoader.java:137) ~[spring-boot-test-3.4.2.jar:3.4.2]
	at org.springframework.boot.test.context.SpringBootContextLoader.loadContext(SpringBootContextLoader.java:108) ~[spring-boot-test-3.4.2.jar:3.4.2]
	at org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate.loadContextInternal(DefaultCacheAwareContextLoaderDelegate.java:225) ~[spring-test-6.2.2.jar:6.2.2]
	at org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate.loadContext(DefaultCacheAwareContextLoaderDelegate.java:152) ~[spring-test-6.2.2.jar:6.2.2]
	at org.springframework.test.context.support.DefaultTestContext.getApplicationContext(DefaultTestContext.java:130) ~[spring-test-6.2.2.jar:6.2.2]
	at org.springframework.test.context.web.ServletTestExecutionListener.setUpRequestContextIfNecessary(ServletTestExecutionListener.java:191) ~[spring-test-6.2.2.jar:6.2.2]
	at org.springframework.test.context.web.ServletTestExecutionListener.prepareTestInstance(ServletTestExecutionListener.java:130) ~[spring-test-6.2.2.jar:6.2.2]
	at org.springframework.test.context.TestContextManager.prepareTestInstance(TestContextManager.java:260) ~[spring-test-6.2.2.jar:6.2.2]
	at org.springframework.test.context.junit.jupiter.SpringExtension.postProcessTestInstance(SpringExtension.java:160) ~[spring-test-6.2.2.jar:6.2.2]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.lambda$invokeTestInstancePostProcessors$11(ClassBasedTestDescriptor.java:378) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.executeAndMaskThrowable(ClassBasedTestDescriptor.java:383) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.lambda$invokeTestInstancePostProcessors$12(ClassBasedTestDescriptor.java:378) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at java.base/java.util.stream.ForEachOps$ForEachOp$OfRef.accept(ForEachOps.java:184) ~[na:na]
	at java.base/java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:215) ~[na:na]
	at java.base/java.util.stream.ReferencePipeline$2$1.accept(ReferencePipeline.java:197) ~[na:na]
	at java.base/java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:215) ~[na:na]
	at java.base/java.util.ArrayList$ArrayListSpliterator.forEachRemaining(ArrayList.java:1709) ~[na:na]
	at java.base/java.util.stream.AbstractPipeline.copyInto(AbstractPipeline.java:570) ~[na:na]
	at java.base/java.util.stream.AbstractPipeline.wrapAndCopyInto(AbstractPipeline.java:560) ~[na:na]
	at java.base/java.util.stream.ForEachOps$ForEachOp.evaluateSequential(ForEachOps.java:151) ~[na:na]
	at java.base/java.util.stream.ForEachOps$ForEachOp$OfRef.evaluateSequential(ForEachOps.java:174) ~[na:na]
	at java.base/java.util.stream.AbstractPipeline.evaluate(AbstractPipeline.java:265) ~[na:na]
	at java.base/java.util.stream.ReferencePipeline.forEach(ReferencePipeline.java:636) ~[na:na]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.invokeTestInstancePostProcessors(ClassBasedTestDescriptor.java:377) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.lambda$instantiateAndPostProcessTestInstance$7(ClassBasedTestDescriptor.java:290) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.instantiateAndPostProcessTestInstance(ClassBasedTestDescriptor.java:289) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.lambda$testInstancesProvider$5(ClassBasedTestDescriptor.java:279) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at java.base/java.util.Optional.orElseGet(Optional.java:364) ~[na:na]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.lambda$testInstancesProvider$6(ClassBasedTestDescriptor.java:278) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.execution.TestInstancesProvider.getTestInstances(TestInstancesProvider.java:31) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.descriptor.TestMethodTestDescriptor.lambda$prepare$1(TestMethodTestDescriptor.java:105) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.jupiter.engine.descriptor.TestMethodTestDescriptor.prepare(TestMethodTestDescriptor.java:104) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.descriptor.TestMethodTestDescriptor.prepare(TestMethodTestDescriptor.java:68) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$prepare$2(NodeTestTask.java:128) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.prepare(NodeTestTask.java:128) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.execute(NodeTestTask.java:95) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at java.base/java.util.ArrayList.forEach(ArrayList.java:1597) ~[na:na]
	at org.junit.platform.engine.support.hierarchical.SameThreadHierarchicalTestExecutorService.invokeAll(SameThreadHierarchicalTestExecutorService.java:41) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$executeRecursively$6(NodeTestTask.java:160) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$executeRecursively$8(NodeTestTask.java:146) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.Node.around(Node.java:137) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$executeRecursively$9(NodeTestTask.java:144) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.executeRecursively(NodeTestTask.java:143) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.execute(NodeTestTask.java:100) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at java.base/java.util.ArrayList.forEach(ArrayList.java:1597) ~[na:na]
	at org.junit.platform.engine.support.hierarchical.SameThreadHierarchicalTestExecutorService.invokeAll(SameThreadHierarchicalTestExecutorService.java:41) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$executeRecursively$6(NodeTestTask.java:160) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$executeRecursively$8(NodeTestTask.java:146) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.Node.around(Node.java:137) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$executeRecursively$9(NodeTestTask.java:144) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.executeRecursively(NodeTestTask.java:143) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.execute(NodeTestTask.java:100) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.SameThreadHierarchicalTestExecutorService.submit(SameThreadHierarchicalTestExecutorService.java:35) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.HierarchicalTestExecutor.execute(HierarchicalTestExecutor.java:57) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.HierarchicalTestEngine.execute(HierarchicalTestEngine.java:54) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.EngineExecutionOrchestrator.execute(EngineExecutionOrchestrator.java:198) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.EngineExecutionOrchestrator.execute(EngineExecutionOrchestrator.java:169) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.EngineExecutionOrchestrator.execute(EngineExecutionOrchestrator.java:93) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.EngineExecutionOrchestrator.lambda$execute$0(EngineExecutionOrchestrator.java:58) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.EngineExecutionOrchestrator.withInterceptedStreams(EngineExecutionOrchestrator.java:141) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.EngineExecutionOrchestrator.execute(EngineExecutionOrchestrator.java:57) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.DefaultLauncher.execute(DefaultLauncher.java:103) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.DefaultLauncher.execute(DefaultLauncher.java:85) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.DelegatingLauncher.execute(DelegatingLauncher.java:47) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.apache.maven.surefire.junitplatform.LazyLauncher.execute(LazyLauncher.java:56) ~[surefire-junit-platform-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.junitplatform.JUnitPlatformProvider.execute(JUnitPlatformProvider.java:184) ~[surefire-junit-platform-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.junitplatform.JUnitPlatformProvider.invokeAllTests(JUnitPlatformProvider.java:148) ~[surefire-junit-platform-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.junitplatform.JUnitPlatformProvider.invoke(JUnitPlatformProvider.java:122) ~[surefire-junit-platform-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.booter.ForkedBooter.runSuitesInProcess(ForkedBooter.java:385) ~[surefire-booter-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.booter.ForkedBooter.execute(ForkedBooter.java:162) ~[surefire-booter-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.booter.ForkedBooter.run(ForkedBooter.java:507) ~[surefire-booter-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.booter.ForkedBooter.main(ForkedBooter.java:495) ~[surefire-booter-3.5.2.jar:3.5.2]

2025-02-15T14:22:37.833+01:00 ERROR 13068 --- [sub-manager-backend] [           main] j.LocalContainerEntityManagerFactoryBean : Failed to initialize JPA EntityManagerFactory: Unable to create requested service [org.hibernate.engine.jdbc.env.spi.JdbcEnvironment] due to: Unable to determine Dialect without JDBC metadata (please set 'jakarta.persistence.jdbc.url' for common cases or 'hibernate.dialect' when a custom Dialect implementation must be provided)
2025-02-15T14:22:37.833+01:00  WARN 13068 --- [sub-manager-backend] [           main] o.s.w.c.s.GenericWebApplicationContext   : Exception encountered during context initialization - cancelling refresh attempt: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'entityManagerFactory' defined in class path resource [org/springframework/boot/autoconfigure/orm/jpa/HibernateJpaConfiguration.class]: Unable to create requested service [org.hibernate.engine.jdbc.env.spi.JdbcEnvironment] due to: Unable to determine Dialect without JDBC metadata (please set 'jakarta.persistence.jdbc.url' for common cases or 'hibernate.dialect' when a custom Dialect implementation must be provided)
2025-02-15T14:22:37.864+01:00  INFO 13068 --- [sub-manager-backend] [           main] .s.b.a.l.ConditionEvaluationReportLogger : 

Error starting ApplicationContext. To display the condition evaluation report re-run your application with 'debug' enabled.
2025-02-15T14:22:37.929+01:00 ERROR 13068 --- [sub-manager-backend] [           main] o.s.boot.SpringApplication               : Application run failed

org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'entityManagerFactory' defined in class path resource [org/springframework/boot/autoconfigure/orm/jpa/HibernateJpaConfiguration.class]: Unable to create requested service [org.hibernate.engine.jdbc.env.spi.JdbcEnvironment] due to: Unable to determine Dialect without JDBC metadata (please set 'jakarta.persistence.jdbc.url' for common cases or 'hibernate.dialect' when a custom Dialect implementation must be provided)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1812) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:601) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:523) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:336) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:307) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:334) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:204) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:970) ~[spring-context-6.2.2.jar:6.2.2]
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:627) ~[spring-context-6.2.2.jar:6.2.2]
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:752) ~[spring-boot-3.4.2.jar:3.4.2]
	at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:439) ~[spring-boot-3.4.2.jar:3.4.2]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:318) ~[spring-boot-3.4.2.jar:3.4.2]
	at org.springframework.boot.test.context.SpringBootContextLoader.lambda$loadContext$3(SpringBootContextLoader.java:137) ~[spring-boot-test-3.4.2.jar:3.4.2]
	at org.springframework.util.function.ThrowingSupplier.get(ThrowingSupplier.java:58) ~[spring-core-6.2.2.jar:6.2.2]
	at org.springframework.util.function.ThrowingSupplier.get(ThrowingSupplier.java:46) ~[spring-core-6.2.2.jar:6.2.2]
	at org.springframework.boot.SpringApplication.withHook(SpringApplication.java:1461) ~[spring-boot-3.4.2.jar:3.4.2]
	at org.springframework.boot.test.context.SpringBootContextLoader$ContextLoaderHook.run(SpringBootContextLoader.java:553) ~[spring-boot-test-3.4.2.jar:3.4.2]
	at org.springframework.boot.test.context.SpringBootContextLoader.loadContext(SpringBootContextLoader.java:137) ~[spring-boot-test-3.4.2.jar:3.4.2]
	at org.springframework.boot.test.context.SpringBootContextLoader.loadContext(SpringBootContextLoader.java:108) ~[spring-boot-test-3.4.2.jar:3.4.2]
	at org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate.loadContextInternal(DefaultCacheAwareContextLoaderDelegate.java:225) ~[spring-test-6.2.2.jar:6.2.2]
	at org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate.loadContext(DefaultCacheAwareContextLoaderDelegate.java:152) ~[spring-test-6.2.2.jar:6.2.2]
	at org.springframework.test.context.support.DefaultTestContext.getApplicationContext(DefaultTestContext.java:130) ~[spring-test-6.2.2.jar:6.2.2]
	at org.springframework.test.context.web.ServletTestExecutionListener.setUpRequestContextIfNecessary(ServletTestExecutionListener.java:191) ~[spring-test-6.2.2.jar:6.2.2]
	at org.springframework.test.context.web.ServletTestExecutionListener.prepareTestInstance(ServletTestExecutionListener.java:130) ~[spring-test-6.2.2.jar:6.2.2]
	at org.springframework.test.context.TestContextManager.prepareTestInstance(TestContextManager.java:260) ~[spring-test-6.2.2.jar:6.2.2]
	at org.springframework.test.context.junit.jupiter.SpringExtension.postProcessTestInstance(SpringExtension.java:160) ~[spring-test-6.2.2.jar:6.2.2]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.lambda$invokeTestInstancePostProcessors$11(ClassBasedTestDescriptor.java:378) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.executeAndMaskThrowable(ClassBasedTestDescriptor.java:383) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.lambda$invokeTestInstancePostProcessors$12(ClassBasedTestDescriptor.java:378) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at java.base/java.util.stream.ForEachOps$ForEachOp$OfRef.accept(ForEachOps.java:184) ~[na:na]
	at java.base/java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:215) ~[na:na]
	at java.base/java.util.stream.ReferencePipeline$2$1.accept(ReferencePipeline.java:197) ~[na:na]
	at java.base/java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:215) ~[na:na]
	at java.base/java.util.ArrayList$ArrayListSpliterator.forEachRemaining(ArrayList.java:1709) ~[na:na]
	at java.base/java.util.stream.AbstractPipeline.copyInto(AbstractPipeline.java:570) ~[na:na]
	at java.base/java.util.stream.AbstractPipeline.wrapAndCopyInto(AbstractPipeline.java:560) ~[na:na]
	at java.base/java.util.stream.ForEachOps$ForEachOp.evaluateSequential(ForEachOps.java:151) ~[na:na]
	at java.base/java.util.stream.ForEachOps$ForEachOp$OfRef.evaluateSequential(ForEachOps.java:174) ~[na:na]
	at java.base/java.util.stream.AbstractPipeline.evaluate(AbstractPipeline.java:265) ~[na:na]
	at java.base/java.util.stream.ReferencePipeline.forEach(ReferencePipeline.java:636) ~[na:na]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.invokeTestInstancePostProcessors(ClassBasedTestDescriptor.java:377) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.lambda$instantiateAndPostProcessTestInstance$7(ClassBasedTestDescriptor.java:290) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.instantiateAndPostProcessTestInstance(ClassBasedTestDescriptor.java:289) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.lambda$testInstancesProvider$5(ClassBasedTestDescriptor.java:279) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at java.base/java.util.Optional.orElseGet(Optional.java:364) ~[na:na]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.lambda$testInstancesProvider$6(ClassBasedTestDescriptor.java:278) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.execution.TestInstancesProvider.getTestInstances(TestInstancesProvider.java:31) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.descriptor.TestMethodTestDescriptor.lambda$prepare$1(TestMethodTestDescriptor.java:105) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.jupiter.engine.descriptor.TestMethodTestDescriptor.prepare(TestMethodTestDescriptor.java:104) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.descriptor.TestMethodTestDescriptor.prepare(TestMethodTestDescriptor.java:68) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$prepare$2(NodeTestTask.java:128) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.prepare(NodeTestTask.java:128) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.execute(NodeTestTask.java:95) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at java.base/java.util.ArrayList.forEach(ArrayList.java:1597) ~[na:na]
	at org.junit.platform.engine.support.hierarchical.SameThreadHierarchicalTestExecutorService.invokeAll(SameThreadHierarchicalTestExecutorService.java:41) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$executeRecursively$6(NodeTestTask.java:160) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$executeRecursively$8(NodeTestTask.java:146) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.Node.around(Node.java:137) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$executeRecursively$9(NodeTestTask.java:144) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.executeRecursively(NodeTestTask.java:143) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.execute(NodeTestTask.java:100) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at java.base/java.util.ArrayList.forEach(ArrayList.java:1597) ~[na:na]
	at org.junit.platform.engine.support.hierarchical.SameThreadHierarchicalTestExecutorService.invokeAll(SameThreadHierarchicalTestExecutorService.java:41) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$executeRecursively$6(NodeTestTask.java:160) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$executeRecursively$8(NodeTestTask.java:146) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.Node.around(Node.java:137) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$executeRecursively$9(NodeTestTask.java:144) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.executeRecursively(NodeTestTask.java:143) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.execute(NodeTestTask.java:100) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.SameThreadHierarchicalTestExecutorService.submit(SameThreadHierarchicalTestExecutorService.java:35) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.HierarchicalTestExecutor.execute(HierarchicalTestExecutor.java:57) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.HierarchicalTestEngine.execute(HierarchicalTestEngine.java:54) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.EngineExecutionOrchestrator.execute(EngineExecutionOrchestrator.java:198) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.EngineExecutionOrchestrator.execute(EngineExecutionOrchestrator.java:169) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.EngineExecutionOrchestrator.execute(EngineExecutionOrchestrator.java:93) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.EngineExecutionOrchestrator.lambda$execute$0(EngineExecutionOrchestrator.java:58) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.EngineExecutionOrchestrator.withInterceptedStreams(EngineExecutionOrchestrator.java:141) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.EngineExecutionOrchestrator.execute(EngineExecutionOrchestrator.java:57) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.DefaultLauncher.execute(DefaultLauncher.java:103) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.DefaultLauncher.execute(DefaultLauncher.java:85) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.DelegatingLauncher.execute(DelegatingLauncher.java:47) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.apache.maven.surefire.junitplatform.LazyLauncher.execute(LazyLauncher.java:56) ~[surefire-junit-platform-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.junitplatform.JUnitPlatformProvider.execute(JUnitPlatformProvider.java:184) ~[surefire-junit-platform-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.junitplatform.JUnitPlatformProvider.invokeAllTests(JUnitPlatformProvider.java:148) ~[surefire-junit-platform-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.junitplatform.JUnitPlatformProvider.invoke(JUnitPlatformProvider.java:122) ~[surefire-junit-platform-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.booter.ForkedBooter.runSuitesInProcess(ForkedBooter.java:385) ~[surefire-booter-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.booter.ForkedBooter.execute(ForkedBooter.java:162) ~[surefire-booter-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.booter.ForkedBooter.run(ForkedBooter.java:507) ~[surefire-booter-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.booter.ForkedBooter.main(ForkedBooter.java:495) ~[surefire-booter-3.5.2.jar:3.5.2]
Caused by: org.hibernate.service.spi.ServiceException: Unable to create requested service [org.hibernate.engine.jdbc.env.spi.JdbcEnvironment] due to: Unable to determine Dialect without JDBC metadata (please set 'jakarta.persistence.jdbc.url' for common cases or 'hibernate.dialect' when a custom Dialect implementation must be provided)
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.createService(AbstractServiceRegistryImpl.java:276) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.initializeService(AbstractServiceRegistryImpl.java:238) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.getService(AbstractServiceRegistryImpl.java:215) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.boot.model.relational.Database.<init>(Database.java:45) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.boot.internal.InFlightMetadataCollectorImpl.getDatabase(InFlightMetadataCollectorImpl.java:226) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.boot.internal.InFlightMetadataCollectorImpl.<init>(InFlightMetadataCollectorImpl.java:194) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.boot.model.process.spi.MetadataBuildingProcess.complete(MetadataBuildingProcess.java:171) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.jpa.boot.internal.EntityManagerFactoryBuilderImpl.metadata(EntityManagerFactoryBuilderImpl.java:1431) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.jpa.boot.internal.EntityManagerFactoryBuilderImpl.build(EntityManagerFactoryBuilderImpl.java:1502) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.springframework.orm.jpa.vendor.SpringHibernateJpaPersistenceProvider.createContainerEntityManagerFactory(SpringHibernateJpaPersistenceProvider.java:66) ~[spring-orm-6.2.2.jar:6.2.2]
	at org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean.createNativeEntityManagerFactory(LocalContainerEntityManagerFactoryBean.java:390) ~[spring-orm-6.2.2.jar:6.2.2]
	at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.buildNativeEntityManagerFactory(AbstractEntityManagerFactoryBean.java:419) ~[spring-orm-6.2.2.jar:6.2.2]
	at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.afterPropertiesSet(AbstractEntityManagerFactoryBean.java:400) ~[spring-orm-6.2.2.jar:6.2.2]
	at org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean.afterPropertiesSet(LocalContainerEntityManagerFactoryBean.java:366) ~[spring-orm-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.invokeInitMethods(AbstractAutowireCapableBeanFactory.java:1859) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1808) ~[spring-beans-6.2.2.jar:6.2.2]
	... 95 common frames omitted
Caused by: org.hibernate.HibernateException: Unable to determine Dialect without JDBC metadata (please set 'jakarta.persistence.jdbc.url' for common cases or 'hibernate.dialect' when a custom Dialect implementation must be provided)
	at org.hibernate.engine.jdbc.dialect.internal.DialectFactoryImpl.determineDialect(DialectFactoryImpl.java:191) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.engine.jdbc.dialect.internal.DialectFactoryImpl.buildDialect(DialectFactoryImpl.java:87) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.getJdbcEnvironmentWithDefaults(JdbcEnvironmentInitiator.java:181) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.getJdbcEnvironmentUsingJdbcMetadata(JdbcEnvironmentInitiator.java:392) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.initiateService(JdbcEnvironmentInitiator.java:129) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.initiateService(JdbcEnvironmentInitiator.java:81) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.boot.registry.internal.StandardServiceRegistryImpl.initiateService(StandardServiceRegistryImpl.java:130) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.createService(AbstractServiceRegistryImpl.java:263) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	... 110 common frames omitted

2025-02-15T14:22:37.939+01:00  WARN 13068 --- [sub-manager-backend] [           main] o.s.test.context.TestContextManager      : Caught exception while allowing TestExecutionListener [org.springframework.test.context.web.ServletTestExecutionListener] to prepare test instance [pl.gabgal.submanager.backend.SubManagerBackendApplicationTests@315b4202]

java.lang.IllegalStateException: Failed to load ApplicationContext for [WebMergedContextConfiguration@28831d69 testClass = pl.gabgal.submanager.backend.SubManagerBackendApplicationTests, locations = [], classes = [pl.gabgal.submanager.backend.SubManagerBackendApplication], contextInitializerClasses = [], activeProfiles = [], propertySourceDescriptors = [], propertySourceProperties = ["org.springframework.boot.test.context.SpringBootTestContextBootstrapper=true"], contextCustomizers = [org.springframework.boot.test.context.filter.ExcludeFilterContextCustomizer@32115b28, org.springframework.boot.test.json.DuplicateJsonObjectContextCustomizerFactory$DuplicateJsonObjectContextCustomizer@4b8729ff, org.springframework.boot.test.mock.mockito.MockitoContextCustomizer@0, org.springframework.boot.test.web.client.TestRestTemplateContextCustomizer@9cb8225, org.springframework.boot.test.web.reactor.netty.DisableReactorResourceFactoryGlobalResourcesContextCustomizerFactory$DisableReactorResourceFactoryGlobalResourcesContextCustomizerCustomizer@18ece7f4, org.springframework.boot.test.autoconfigure.OnFailureConditionReportContextCustomizerFactory$OnFailureConditionReportContextCustomizer@33f676f6, org.springframework.boot.test.autoconfigure.actuate.observability.ObservabilityContextCustomizerFactory$DisableObservabilityContextCustomizer@1f, org.springframework.boot.test.autoconfigure.properties.PropertyMappingContextCustomizer@0, org.springframework.boot.test.autoconfigure.web.servlet.WebDriverContextCustomizer@75c56eb9, org.springframework.test.context.support.DynamicPropertiesContextCustomizer@0, org.springframework.boot.test.context.SpringBootTestAnnotation@2545709a], resourceBasePath = "src/main/webapp", contextLoader = org.springframework.boot.test.context.SpringBootContextLoader, parent = null]
	at org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate.loadContext(DefaultCacheAwareContextLoaderDelegate.java:180) ~[spring-test-6.2.2.jar:6.2.2]
	at org.springframework.test.context.support.DefaultTestContext.getApplicationContext(DefaultTestContext.java:130) ~[spring-test-6.2.2.jar:6.2.2]
	at org.springframework.test.context.web.ServletTestExecutionListener.setUpRequestContextIfNecessary(ServletTestExecutionListener.java:191) ~[spring-test-6.2.2.jar:6.2.2]
	at org.springframework.test.context.web.ServletTestExecutionListener.prepareTestInstance(ServletTestExecutionListener.java:130) ~[spring-test-6.2.2.jar:6.2.2]
	at org.springframework.test.context.TestContextManager.prepareTestInstance(TestContextManager.java:260) ~[spring-test-6.2.2.jar:6.2.2]
	at org.springframework.test.context.junit.jupiter.SpringExtension.postProcessTestInstance(SpringExtension.java:160) ~[spring-test-6.2.2.jar:6.2.2]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.lambda$invokeTestInstancePostProcessors$11(ClassBasedTestDescriptor.java:378) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.executeAndMaskThrowable(ClassBasedTestDescriptor.java:383) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.lambda$invokeTestInstancePostProcessors$12(ClassBasedTestDescriptor.java:378) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at java.base/java.util.stream.ForEachOps$ForEachOp$OfRef.accept(ForEachOps.java:184) ~[na:na]
	at java.base/java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:215) ~[na:na]
	at java.base/java.util.stream.ReferencePipeline$2$1.accept(ReferencePipeline.java:197) ~[na:na]
	at java.base/java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:215) ~[na:na]
	at java.base/java.util.ArrayList$ArrayListSpliterator.forEachRemaining(ArrayList.java:1709) ~[na:na]
	at java.base/java.util.stream.AbstractPipeline.copyInto(AbstractPipeline.java:570) ~[na:na]
	at java.base/java.util.stream.AbstractPipeline.wrapAndCopyInto(AbstractPipeline.java:560) ~[na:na]
	at java.base/java.util.stream.ForEachOps$ForEachOp.evaluateSequential(ForEachOps.java:151) ~[na:na]
	at java.base/java.util.stream.ForEachOps$ForEachOp$OfRef.evaluateSequential(ForEachOps.java:174) ~[na:na]
	at java.base/java.util.stream.AbstractPipeline.evaluate(AbstractPipeline.java:265) ~[na:na]
	at java.base/java.util.stream.ReferencePipeline.forEach(ReferencePipeline.java:636) ~[na:na]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.invokeTestInstancePostProcessors(ClassBasedTestDescriptor.java:377) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.lambda$instantiateAndPostProcessTestInstance$7(ClassBasedTestDescriptor.java:290) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.instantiateAndPostProcessTestInstance(ClassBasedTestDescriptor.java:289) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.lambda$testInstancesProvider$5(ClassBasedTestDescriptor.java:279) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at java.base/java.util.Optional.orElseGet(Optional.java:364) ~[na:na]
	at org.junit.jupiter.engine.descriptor.ClassBasedTestDescriptor.lambda$testInstancesProvider$6(ClassBasedTestDescriptor.java:278) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.execution.TestInstancesProvider.getTestInstances(TestInstancesProvider.java:31) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.descriptor.TestMethodTestDescriptor.lambda$prepare$1(TestMethodTestDescriptor.java:105) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.jupiter.engine.descriptor.TestMethodTestDescriptor.prepare(TestMethodTestDescriptor.java:104) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.jupiter.engine.descriptor.TestMethodTestDescriptor.prepare(TestMethodTestDescriptor.java:68) ~[junit-jupiter-engine-5.11.4.jar:5.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$prepare$2(NodeTestTask.java:128) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.prepare(NodeTestTask.java:128) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.execute(NodeTestTask.java:95) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at java.base/java.util.ArrayList.forEach(ArrayList.java:1597) ~[na:na]
	at org.junit.platform.engine.support.hierarchical.SameThreadHierarchicalTestExecutorService.invokeAll(SameThreadHierarchicalTestExecutorService.java:41) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$executeRecursively$6(NodeTestTask.java:160) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$executeRecursively$8(NodeTestTask.java:146) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.Node.around(Node.java:137) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$executeRecursively$9(NodeTestTask.java:144) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.executeRecursively(NodeTestTask.java:143) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.execute(NodeTestTask.java:100) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at java.base/java.util.ArrayList.forEach(ArrayList.java:1597) ~[na:na]
	at org.junit.platform.engine.support.hierarchical.SameThreadHierarchicalTestExecutorService.invokeAll(SameThreadHierarchicalTestExecutorService.java:41) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$executeRecursively$6(NodeTestTask.java:160) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$executeRecursively$8(NodeTestTask.java:146) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.Node.around(Node.java:137) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.lambda$executeRecursively$9(NodeTestTask.java:144) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.ThrowableCollector.execute(ThrowableCollector.java:73) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.executeRecursively(NodeTestTask.java:143) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.NodeTestTask.execute(NodeTestTask.java:100) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.SameThreadHierarchicalTestExecutorService.submit(SameThreadHierarchicalTestExecutorService.java:35) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.HierarchicalTestExecutor.execute(HierarchicalTestExecutor.java:57) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.engine.support.hierarchical.HierarchicalTestEngine.execute(HierarchicalTestEngine.java:54) ~[junit-platform-engine-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.EngineExecutionOrchestrator.execute(EngineExecutionOrchestrator.java:198) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.EngineExecutionOrchestrator.execute(EngineExecutionOrchestrator.java:169) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.EngineExecutionOrchestrator.execute(EngineExecutionOrchestrator.java:93) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.EngineExecutionOrchestrator.lambda$execute$0(EngineExecutionOrchestrator.java:58) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.EngineExecutionOrchestrator.withInterceptedStreams(EngineExecutionOrchestrator.java:141) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.EngineExecutionOrchestrator.execute(EngineExecutionOrchestrator.java:57) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.DefaultLauncher.execute(DefaultLauncher.java:103) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.DefaultLauncher.execute(DefaultLauncher.java:85) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.junit.platform.launcher.core.DelegatingLauncher.execute(DelegatingLauncher.java:47) ~[junit-platform-launcher-1.11.4.jar:1.11.4]
	at org.apache.maven.surefire.junitplatform.LazyLauncher.execute(LazyLauncher.java:56) ~[surefire-junit-platform-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.junitplatform.JUnitPlatformProvider.execute(JUnitPlatformProvider.java:184) ~[surefire-junit-platform-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.junitplatform.JUnitPlatformProvider.invokeAllTests(JUnitPlatformProvider.java:148) ~[surefire-junit-platform-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.junitplatform.JUnitPlatformProvider.invoke(JUnitPlatformProvider.java:122) ~[surefire-junit-platform-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.booter.ForkedBooter.runSuitesInProcess(ForkedBooter.java:385) ~[surefire-booter-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.booter.ForkedBooter.execute(ForkedBooter.java:162) ~[surefire-booter-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.booter.ForkedBooter.run(ForkedBooter.java:507) ~[surefire-booter-3.5.2.jar:3.5.2]
	at org.apache.maven.surefire.booter.ForkedBooter.main(ForkedBooter.java:495) ~[surefire-booter-3.5.2.jar:3.5.2]
Caused by: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'entityManagerFactory' defined in class path resource [org/springframework/boot/autoconfigure/orm/jpa/HibernateJpaConfiguration.class]: Unable to create requested service [org.hibernate.engine.jdbc.env.spi.JdbcEnvironment] due to: Unable to determine Dialect without JDBC metadata (please set 'jakarta.persistence.jdbc.url' for common cases or 'hibernate.dialect' when a custom Dialect implementation must be provided)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1812) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:601) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:523) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:336) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:307) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:334) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:204) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:970) ~[spring-context-6.2.2.jar:6.2.2]
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:627) ~[spring-context-6.2.2.jar:6.2.2]
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:752) ~[spring-boot-3.4.2.jar:3.4.2]
	at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:439) ~[spring-boot-3.4.2.jar:3.4.2]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:318) ~[spring-boot-3.4.2.jar:3.4.2]
	at org.springframework.boot.test.context.SpringBootContextLoader.lambda$loadContext$3(SpringBootContextLoader.java:137) ~[spring-boot-test-3.4.2.jar:3.4.2]
	at org.springframework.util.function.ThrowingSupplier.get(ThrowingSupplier.java:58) ~[spring-core-6.2.2.jar:6.2.2]
	at org.springframework.util.function.ThrowingSupplier.get(ThrowingSupplier.java:46) ~[spring-core-6.2.2.jar:6.2.2]
	at org.springframework.boot.SpringApplication.withHook(SpringApplication.java:1461) ~[spring-boot-3.4.2.jar:3.4.2]
	at org.springframework.boot.test.context.SpringBootContextLoader$ContextLoaderHook.run(SpringBootContextLoader.java:553) ~[spring-boot-test-3.4.2.jar:3.4.2]
	at org.springframework.boot.test.context.SpringBootContextLoader.loadContext(SpringBootContextLoader.java:137) ~[spring-boot-test-3.4.2.jar:3.4.2]
	at org.springframework.boot.test.context.SpringBootContextLoader.loadContext(SpringBootContextLoader.java:108) ~[spring-boot-test-3.4.2.jar:3.4.2]
	at org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate.loadContextInternal(DefaultCacheAwareContextLoaderDelegate.java:225) ~[spring-test-6.2.2.jar:6.2.2]
	at org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate.loadContext(DefaultCacheAwareContextLoaderDelegate.java:152) ~[spring-test-6.2.2.jar:6.2.2]
	... 75 common frames omitted
Caused by: org.hibernate.service.spi.ServiceException: Unable to create requested service [org.hibernate.engine.jdbc.env.spi.JdbcEnvironment] due to: Unable to determine Dialect without JDBC metadata (please set 'jakarta.persistence.jdbc.url' for common cases or 'hibernate.dialect' when a custom Dialect implementation must be provided)
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.createService(AbstractServiceRegistryImpl.java:276) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.initializeService(AbstractServiceRegistryImpl.java:238) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.getService(AbstractServiceRegistryImpl.java:215) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.boot.model.relational.Database.<init>(Database.java:45) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.boot.internal.InFlightMetadataCollectorImpl.getDatabase(InFlightMetadataCollectorImpl.java:226) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.boot.internal.InFlightMetadataCollectorImpl.<init>(InFlightMetadataCollectorImpl.java:194) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.boot.model.process.spi.MetadataBuildingProcess.complete(MetadataBuildingProcess.java:171) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.jpa.boot.internal.EntityManagerFactoryBuilderImpl.metadata(EntityManagerFactoryBuilderImpl.java:1431) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.jpa.boot.internal.EntityManagerFactoryBuilderImpl.build(EntityManagerFactoryBuilderImpl.java:1502) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.springframework.orm.jpa.vendor.SpringHibernateJpaPersistenceProvider.createContainerEntityManagerFactory(SpringHibernateJpaPersistenceProvider.java:66) ~[spring-orm-6.2.2.jar:6.2.2]
	at org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean.createNativeEntityManagerFactory(LocalContainerEntityManagerFactoryBean.java:390) ~[spring-orm-6.2.2.jar:6.2.2]
	at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.buildNativeEntityManagerFactory(AbstractEntityManagerFactoryBean.java:419) ~[spring-orm-6.2.2.jar:6.2.2]
	at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.afterPropertiesSet(AbstractEntityManagerFactoryBean.java:400) ~[spring-orm-6.2.2.jar:6.2.2]
	at org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean.afterPropertiesSet(LocalContainerEntityManagerFactoryBean.java:366) ~[spring-orm-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.invokeInitMethods(AbstractAutowireCapableBeanFactory.java:1859) ~[spring-beans-6.2.2.jar:6.2.2]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1808) ~[spring-beans-6.2.2.jar:6.2.2]
	... 95 common frames omitted
Caused by: org.hibernate.HibernateException: Unable to determine Dialect without JDBC metadata (please set 'jakarta.persistence.jdbc.url' for common cases or 'hibernate.dialect' when a custom Dialect implementation must be provided)
	at org.hibernate.engine.jdbc.dialect.internal.DialectFactoryImpl.determineDialect(DialectFactoryImpl.java:191) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.engine.jdbc.dialect.internal.DialectFactoryImpl.buildDialect(DialectFactoryImpl.java:87) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.getJdbcEnvironmentWithDefaults(JdbcEnvironmentInitiator.java:181) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.getJdbcEnvironmentUsingJdbcMetadata(JdbcEnvironmentInitiator.java:392) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.initiateService(JdbcEnvironmentInitiator.java:129) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.initiateService(JdbcEnvironmentInitiator.java:81) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.boot.registry.internal.StandardServiceRegistryImpl.initiateService(StandardServiceRegistryImpl.java:130) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.createService(AbstractServiceRegistryImpl.java:263) ~[hibernate-core-6.6.5.Final.jar:6.6.5.Final]
	... 110 common frames omitted

]]></system-out>
    <system-err><![CDATA[


============================
CONDITIONS EVALUATION REPORT
============================


Positive matches:
-----------------

   AopAutoConfiguration matched:
      - @ConditionalOnProperty (spring.aop.auto=true) matched (OnPropertyCondition)

   AopAutoConfiguration.AspectJAutoProxyingConfiguration matched:
      - @ConditionalOnClass found required class 'org.aspectj.weaver.Advice' (OnClassCondition)

   AopAutoConfiguration.AspectJAutoProxyingConfiguration.CglibAutoProxyConfiguration matched:
      - @ConditionalOnProperty (spring.aop.proxy-target-class=true) matched (OnPropertyCondition)

   ApplicationAvailabilityAutoConfiguration#applicationAvailability matched:
      - @ConditionalOnMissingBean (types: org.springframework.boot.availability.ApplicationAvailability; SearchStrategy: all) did not find any beans (OnBeanCondition)

   DataSourceAutoConfiguration matched:
      - @ConditionalOnClass found required classes 'javax.sql.DataSource', 'org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType' (OnClassCondition)
      - @ConditionalOnMissingBean (types: io.r2dbc.spi.ConnectionFactory; SearchStrategy: all) did not find any beans (OnBeanCondition)

   DataSourceAutoConfiguration.PooledDataSourceConfiguration matched:
      - AnyNestedCondition 1 matched 1 did not; NestedCondition on DataSourceAutoConfiguration.PooledDataSourceCondition.PooledDataSourceAvailable PooledDataSource found supported DataSource; NestedCondition on DataSourceAutoConfiguration.PooledDataSourceCondition.ExplicitType @ConditionalOnProperty (spring.datasource.type) did not find property 'type' (DataSourceAutoConfiguration.PooledDataSourceCondition)
      - @ConditionalOnMissingBean (types: javax.sql.DataSource,javax.sql.XADataSource; SearchStrategy: all) did not find any beans (OnBeanCondition)

   DataSourceAutoConfiguration.PooledDataSourceConfiguration#jdbcConnectionDetails matched:
      - @ConditionalOnMissingBean (types: org.springframework.boot.autoconfigure.jdbc.JdbcConnectionDetails; SearchStrategy: all) did not find any beans (OnBeanCondition)

   DataSourceConfiguration.Hikari matched:
      - @ConditionalOnClass found required class 'com.zaxxer.hikari.HikariDataSource' (OnClassCondition)
      - @ConditionalOnProperty (spring.datasource.type=com.zaxxer.hikari.HikariDataSource) matched (OnPropertyCondition)
      - @ConditionalOnMissingBean (types: javax.sql.DataSource; SearchStrategy: all) did not find any beans (OnBeanCondition)

   DataSourceInitializationConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.jdbc.datasource.init.DatabasePopulator' (OnClassCondition)
      - @ConditionalOnSingleCandidate (types: javax.sql.DataSource; SearchStrategy: all) found a single bean 'dataSource'; @ConditionalOnMissingBean (types: org.springframework.boot.autoconfigure.sql.init.SqlDataSourceScriptDatabaseInitializer,org.springframework.boot.autoconfigure.sql.init.SqlR2dbcScriptDatabaseInitializer; SearchStrategy: all) did not find any beans (OnBeanCondition)

   DataSourcePoolMetadataProvidersConfiguration.HikariPoolDataSourceMetadataProviderConfiguration matched:
      - @ConditionalOnClass found required class 'com.zaxxer.hikari.HikariDataSource' (OnClassCondition)

   DataSourceTransactionManagerAutoConfiguration matched:
      - @ConditionalOnClass found required classes 'javax.sql.DataSource', 'org.springframework.jdbc.core.JdbcTemplate', 'org.springframework.transaction.TransactionManager' (OnClassCondition)

   DataSourceTransactionManagerAutoConfiguration.JdbcTransactionManagerConfiguration matched:
      - @ConditionalOnSingleCandidate (types: javax.sql.DataSource; SearchStrategy: all) found a single bean 'dataSource' (OnBeanCondition)

   DispatcherServletAutoConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.web.servlet.DispatcherServlet' (OnClassCondition)
      - found 'session' scope (OnWebApplicationCondition)

   DispatcherServletAutoConfiguration.DispatcherServletConfiguration matched:
      - @ConditionalOnClass found required class 'jakarta.servlet.ServletRegistration' (OnClassCondition)
      - Default DispatcherServlet did not find dispatcher servlet beans (DispatcherServletAutoConfiguration.DefaultDispatcherServletCondition)

   DispatcherServletAutoConfiguration.DispatcherServletRegistrationConfiguration matched:
      - @ConditionalOnClass found required class 'jakarta.servlet.ServletRegistration' (OnClassCondition)
      - DispatcherServlet Registration did not find servlet registration bean (DispatcherServletAutoConfiguration.DispatcherServletRegistrationCondition)

   DispatcherServletAutoConfiguration.DispatcherServletRegistrationConfiguration#dispatcherServletRegistration matched:
      - @ConditionalOnBean (names: dispatcherServlet types: org.springframework.web.servlet.DispatcherServlet; SearchStrategy: all) found bean 'dispatcherServlet' (OnBeanCondition)

   ErrorMvcAutoConfiguration matched:
      - @ConditionalOnClass found required classes 'jakarta.servlet.Servlet', 'org.springframework.web.servlet.DispatcherServlet' (OnClassCondition)
      - found 'session' scope (OnWebApplicationCondition)

   ErrorMvcAutoConfiguration#basicErrorController matched:
      - @ConditionalOnMissingBean (types: org.springframework.boot.web.servlet.error.ErrorController; SearchStrategy: current) did not find any beans (OnBeanCondition)

   ErrorMvcAutoConfiguration#errorAttributes matched:
      - @ConditionalOnMissingBean (types: org.springframework.boot.web.servlet.error.ErrorAttributes; SearchStrategy: current) did not find any beans (OnBeanCondition)

   ErrorMvcAutoConfiguration.DefaultErrorViewResolverConfiguration#conventionErrorViewResolver matched:
      - @ConditionalOnBean (types: org.springframework.web.servlet.DispatcherServlet; SearchStrategy: all) found bean 'dispatcherServlet'; @ConditionalOnMissingBean (types: org.springframework.boot.autoconfigure.web.servlet.error.ErrorViewResolver; SearchStrategy: all) did not find any beans (OnBeanCondition)

   ErrorMvcAutoConfiguration.WhitelabelErrorViewConfiguration matched:
      - @ConditionalOnProperty (server.error.whitelabel.enabled) matched (OnPropertyCondition)
      - ErrorTemplate Missing did not find error template view (ErrorMvcAutoConfiguration.ErrorTemplateMissingCondition)

   ErrorMvcAutoConfiguration.WhitelabelErrorViewConfiguration#beanNameViewResolver matched:
      - @ConditionalOnMissingBean (types: org.springframework.web.servlet.view.BeanNameViewResolver; SearchStrategy: all) did not find any beans (OnBeanCondition)

   ErrorMvcAutoConfiguration.WhitelabelErrorViewConfiguration#defaultErrorView matched:
      - @ConditionalOnMissingBean (names: error; SearchStrategy: all) did not find any beans (OnBeanCondition)

   GenericCacheConfiguration matched:
      - Cache org.springframework.boot.autoconfigure.cache.GenericCacheConfiguration automatic cache type (CacheCondition)

   HibernateJpaAutoConfiguration matched:
      - @ConditionalOnClass found required classes 'org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean', 'jakarta.persistence.EntityManager', 'org.hibernate.engine.spi.SessionImplementor' (OnClassCondition)

   HibernateJpaConfiguration matched:
      - @ConditionalOnSingleCandidate (types: javax.sql.DataSource; SearchStrategy: all) found a single bean 'dataSource' (OnBeanCondition)

   HttpClientAutoConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.http.client.ClientHttpRequestFactory' (OnClassCondition)
      - NoneNestedConditions 0 matched 1 did not; NestedCondition on NotReactiveWebApplicationCondition.ReactiveWebApplication did not find reactive web application classes (NotReactiveWebApplicationCondition)

   HttpClientAutoConfiguration#clientHttpRequestFactoryBuilder matched:
      - @ConditionalOnMissingBean (types: org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder; SearchStrategy: all) did not find any beans (OnBeanCondition)

   HttpClientAutoConfiguration#clientHttpRequestFactorySettings matched:
      - @ConditionalOnMissingBean (types: org.springframework.boot.http.client.ClientHttpRequestFactorySettings; SearchStrategy: all) did not find any beans (OnBeanCondition)

   HttpEncodingAutoConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.web.filter.CharacterEncodingFilter' (OnClassCondition)
      - found 'session' scope (OnWebApplicationCondition)
      - @ConditionalOnProperty (server.servlet.encoding.enabled) matched (OnPropertyCondition)

   HttpEncodingAutoConfiguration#characterEncodingFilter matched:
      - @ConditionalOnMissingBean (types: org.springframework.web.filter.CharacterEncodingFilter; SearchStrategy: all) did not find any beans (OnBeanCondition)

   HttpMessageConvertersAutoConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.http.converter.HttpMessageConverter' (OnClassCondition)
      - NoneNestedConditions 0 matched 1 did not; NestedCondition on HttpMessageConvertersAutoConfiguration.NotReactiveWebApplicationCondition.ReactiveWebApplication did not find reactive web application classes (HttpMessageConvertersAutoConfiguration.NotReactiveWebApplicationCondition)

   HttpMessageConvertersAutoConfiguration#messageConverters matched:
      - @ConditionalOnMissingBean (types: org.springframework.boot.autoconfigure.http.HttpMessageConverters; SearchStrategy: all) did not find any beans (OnBeanCondition)

   HttpMessageConvertersAutoConfiguration.StringHttpMessageConverterConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.http.converter.StringHttpMessageConverter' (OnClassCondition)

   HttpMessageConvertersAutoConfiguration.StringHttpMessageConverterConfiguration#stringHttpMessageConverter matched:
      - @ConditionalOnMissingBean (types: org.springframework.http.converter.StringHttpMessageConverter; SearchStrategy: all) did not find any beans (OnBeanCondition)

   JacksonAutoConfiguration matched:
      - @ConditionalOnClass found required class 'com.fasterxml.jackson.databind.ObjectMapper' (OnClassCondition)

   JacksonAutoConfiguration.Jackson2ObjectMapperBuilderCustomizerConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.http.converter.json.Jackson2ObjectMapperBuilder' (OnClassCondition)

   JacksonAutoConfiguration.JacksonObjectMapperBuilderConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.http.converter.json.Jackson2ObjectMapperBuilder' (OnClassCondition)

   JacksonAutoConfiguration.JacksonObjectMapperBuilderConfiguration#jacksonObjectMapperBuilder matched:
      - @ConditionalOnMissingBean (types: org.springframework.http.converter.json.Jackson2ObjectMapperBuilder; SearchStrategy: all) did not find any beans (OnBeanCondition)

   JacksonAutoConfiguration.JacksonObjectMapperConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.http.converter.json.Jackson2ObjectMapperBuilder' (OnClassCondition)

   JacksonAutoConfiguration.JacksonObjectMapperConfiguration#jacksonObjectMapper matched:
      - @ConditionalOnMissingBean (types: com.fasterxml.jackson.databind.ObjectMapper; SearchStrategy: all) did not find any beans (OnBeanCondition)

   JacksonAutoConfiguration.ParameterNamesModuleConfiguration matched:
      - @ConditionalOnClass found required class 'com.fasterxml.jackson.module.paramnames.ParameterNamesModule' (OnClassCondition)

   JacksonAutoConfiguration.ParameterNamesModuleConfiguration#parameterNamesModule matched:
      - @ConditionalOnMissingBean (types: com.fasterxml.jackson.module.paramnames.ParameterNamesModule; SearchStrategy: all) did not find any beans (OnBeanCondition)

   JacksonHttpMessageConvertersConfiguration.MappingJackson2HttpMessageConverterConfiguration matched:
      - @ConditionalOnClass found required class 'com.fasterxml.jackson.databind.ObjectMapper' (OnClassCondition)
      - @ConditionalOnProperty (spring.mvc.converters.preferred-json-mapper=jackson) matched (OnPropertyCondition)
      - @ConditionalOnBean (types: com.fasterxml.jackson.databind.ObjectMapper; SearchStrategy: all) found bean 'jacksonObjectMapper' (OnBeanCondition)

   JacksonHttpMessageConvertersConfiguration.MappingJackson2HttpMessageConverterConfiguration#mappingJackson2HttpMessageConverter matched:
      - @ConditionalOnMissingBean (types: org.springframework.http.converter.json.MappingJackson2HttpMessageConverter ignored: org.springframework.hateoas.server.mvc.TypeConstrainedMappingJackson2HttpMessageConverter,org.springframework.data.rest.webmvc.alps.AlpsJsonHttpMessageConverter; SearchStrategy: all) did not find any beans (OnBeanCondition)

   JdbcClientAutoConfiguration matched:
      - @ConditionalOnSingleCandidate (types: org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate; SearchStrategy: all) found a single bean 'namedParameterJdbcTemplate'; @ConditionalOnMissingBean (types: org.springframework.jdbc.core.simple.JdbcClient; SearchStrategy: all) did not find any beans (OnBeanCondition)

   JdbcTemplateAutoConfiguration matched:
      - @ConditionalOnClass found required classes 'javax.sql.DataSource', 'org.springframework.jdbc.core.JdbcTemplate' (OnClassCondition)
      - @ConditionalOnSingleCandidate (types: javax.sql.DataSource; SearchStrategy: all) found a single bean 'dataSource' (OnBeanCondition)

   JdbcTemplateConfiguration matched:
      - @ConditionalOnMissingBean (types: org.springframework.jdbc.core.JdbcOperations; SearchStrategy: all) did not find any beans (OnBeanCondition)

   JpaBaseConfiguration#entityManagerFactory matched:
      - @ConditionalOnMissingBean (types: org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean,jakarta.persistence.EntityManagerFactory; SearchStrategy: all) did not find any beans (OnBeanCondition)

   JpaBaseConfiguration#entityManagerFactoryBuilder matched:
      - @ConditionalOnMissingBean (types: org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder; SearchStrategy: all) did not find any beans (OnBeanCondition)

   JpaBaseConfiguration#jpaVendorAdapter matched:
      - @ConditionalOnMissingBean (types: org.springframework.orm.jpa.JpaVendorAdapter; SearchStrategy: all) did not find any beans (OnBeanCondition)

   JpaBaseConfiguration#transactionManager matched:
      - @ConditionalOnMissingBean (types: org.springframework.transaction.TransactionManager; SearchStrategy: all) did not find any beans (OnBeanCondition)

   JpaBaseConfiguration.JpaWebConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.web.servlet.config.annotation.WebMvcConfigurer' (OnClassCondition)
      - found 'session' scope (OnWebApplicationCondition)
      - @ConditionalOnProperty (spring.jpa.open-in-view=true) matched (OnPropertyCondition)
      - @ConditionalOnMissingBean (types: org.springframework.orm.jpa.support.OpenEntityManagerInViewInterceptor,org.springframework.orm.jpa.support.OpenEntityManagerInViewFilter; SearchStrategy: all) did not find any beans (OnBeanCondition)

   JpaBaseConfiguration.PersistenceManagedTypesConfiguration matched:
      - @ConditionalOnMissingBean (types: org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean,jakarta.persistence.EntityManagerFactory; SearchStrategy: all) did not find any beans (OnBeanCondition)

   JpaBaseConfiguration.PersistenceManagedTypesConfiguration#persistenceManagedTypes matched:
      - @ConditionalOnMissingBean (types: org.springframework.orm.jpa.persistenceunit.PersistenceManagedTypes; SearchStrategy: all) did not find any beans (OnBeanCondition)

   JpaRepositoriesAutoConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.data.jpa.repository.JpaRepository' (OnClassCondition)
      - @ConditionalOnProperty (spring.data.jpa.repositories.enabled=true) matched (OnPropertyCondition)
      - @ConditionalOnBean (types: javax.sql.DataSource; SearchStrategy: all) found bean 'dataSource'; @ConditionalOnMissingBean (types: org.springframework.data.jpa.repository.support.JpaRepositoryFactoryBean,org.springframework.data.jpa.repository.config.JpaRepositoryConfigExtension; SearchStrategy: all) did not find any beans (OnBeanCondition)

   JtaAutoConfiguration matched:
      - @ConditionalOnClass found required class 'jakarta.transaction.Transaction' (OnClassCondition)
      - @ConditionalOnProperty (spring.jta.enabled) matched (OnPropertyCondition)

   LifecycleAutoConfiguration#defaultLifecycleProcessor matched:
      - @ConditionalOnMissingBean (names: lifecycleProcessor; SearchStrategy: current) did not find any beans (OnBeanCondition)

   MultipartAutoConfiguration matched:
      - @ConditionalOnClass found required classes 'jakarta.servlet.Servlet', 'org.springframework.web.multipart.support.StandardServletMultipartResolver', 'jakarta.servlet.MultipartConfigElement' (OnClassCondition)
      - found 'session' scope (OnWebApplicationCondition)
      - @ConditionalOnProperty (spring.servlet.multipart.enabled) matched (OnPropertyCondition)

   MultipartAutoConfiguration#multipartConfigElement matched:
      - @ConditionalOnMissingBean (types: jakarta.servlet.MultipartConfigElement; SearchStrategy: all) did not find any beans (OnBeanCondition)

   MultipartAutoConfiguration#multipartResolver matched:
      - @ConditionalOnMissingBean (types: org.springframework.web.multipart.MultipartResolver; SearchStrategy: all) did not find any beans (OnBeanCondition)

   NamedParameterJdbcTemplateConfiguration matched:
      - @ConditionalOnSingleCandidate (types: org.springframework.jdbc.core.JdbcTemplate; SearchStrategy: all) found a single bean 'jdbcTemplate'; @ConditionalOnMissingBean (types: org.springframework.jdbc.core.namedparam.NamedParameterJdbcOperations; SearchStrategy: all) did not find any beans (OnBeanCondition)

   NoOpCacheConfiguration matched:
      - Cache org.springframework.boot.autoconfigure.cache.NoOpCacheConfiguration automatic cache type (CacheCondition)

   PersistenceExceptionTranslationAutoConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.dao.annotation.PersistenceExceptionTranslationPostProcessor' (OnClassCondition)

   PersistenceExceptionTranslationAutoConfiguration#persistenceExceptionTranslationPostProcessor matched:
      - @ConditionalOnProperty (spring.dao.exceptiontranslation.enabled) matched (OnPropertyCondition)
      - @ConditionalOnMissingBean (types: org.springframework.dao.annotation.PersistenceExceptionTranslationPostProcessor; SearchStrategy: all) did not find any beans (OnBeanCondition)

   PropertyPlaceholderAutoConfiguration#propertySourcesPlaceholderConfigurer matched:
      - @ConditionalOnMissingBean (types: org.springframework.context.support.PropertySourcesPlaceholderConfigurer; SearchStrategy: current) did not find any beans (OnBeanCondition)

   RestClientAutoConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.web.client.RestClient' (OnClassCondition)
      - NoneNestedConditions 0 matched 1 did not; NestedCondition on NotReactiveWebApplicationCondition.ReactiveWebApplication did not find reactive web application classes (NotReactiveWebApplicationCondition)

   RestClientAutoConfiguration#httpMessageConvertersRestClientCustomizer matched:
      - @ConditionalOnMissingBean (types: org.springframework.boot.autoconfigure.web.client.HttpMessageConvertersRestClientCustomizer; SearchStrategy: all) did not find any beans (OnBeanCondition)

   RestClientAutoConfiguration#restClientBuilder matched:
      - @ConditionalOnMissingBean (types: org.springframework.web.client.RestClient$Builder; SearchStrategy: all) did not find any beans (OnBeanCondition)

   RestClientAutoConfiguration#restClientBuilderConfigurer matched:
      - @ConditionalOnMissingBean (types: org.springframework.boot.autoconfigure.web.client.RestClientBuilderConfigurer; SearchStrategy: all) did not find any beans (OnBeanCondition)

   RestClientAutoConfiguration#restClientSsl matched:
      - @ConditionalOnBean (types: org.springframework.boot.ssl.SslBundles; SearchStrategy: all) found bean 'sslBundleRegistry'; @ConditionalOnMissingBean (types: org.springframework.boot.autoconfigure.web.client.RestClientSsl; SearchStrategy: all) did not find any beans (OnBeanCondition)

   RestTemplateAutoConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.web.client.RestTemplate' (OnClassCondition)
      - NoneNestedConditions 0 matched 1 did not; NestedCondition on NotReactiveWebApplicationCondition.ReactiveWebApplication did not find reactive web application classes (NotReactiveWebApplicationCondition)

   RestTemplateAutoConfiguration#restTemplateBuilder matched:
      - @ConditionalOnMissingBean (types: org.springframework.boot.web.client.RestTemplateBuilder; SearchStrategy: all) did not find any beans (OnBeanCondition)

   SecurityAutoConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.security.authentication.DefaultAuthenticationEventPublisher' (OnClassCondition)

   SecurityAutoConfiguration#authenticationEventPublisher matched:
      - @ConditionalOnMissingBean (types: org.springframework.security.authentication.AuthenticationEventPublisher; SearchStrategy: all) did not find any beans (OnBeanCondition)

   SecurityFilterAutoConfiguration matched:
      - @ConditionalOnClass found required classes 'org.springframework.security.web.context.AbstractSecurityWebApplicationInitializer', 'org.springframework.security.config.http.SessionCreationPolicy' (OnClassCondition)
      - found 'session' scope (OnWebApplicationCondition)

   SecurityFilterAutoConfiguration#securityFilterChainRegistration matched:
      - @ConditionalOnBean (names: springSecurityFilterChain; SearchStrategy: all) found bean 'springSecurityFilterChain' (OnBeanCondition)

   ServletWebServerFactoryAutoConfiguration matched:
      - @ConditionalOnClass found required class 'jakarta.servlet.ServletRequest' (OnClassCondition)
      - found 'session' scope (OnWebApplicationCondition)

   ServletWebServerFactoryAutoConfiguration#tomcatServletWebServerFactoryCustomizer matched:
      - @ConditionalOnClass found required class 'org.apache.catalina.startup.Tomcat' (OnClassCondition)

   ServletWebServerFactoryConfiguration.EmbeddedTomcat matched:
      - @ConditionalOnClass found required classes 'jakarta.servlet.Servlet', 'org.apache.catalina.startup.Tomcat', 'org.apache.coyote.UpgradeProtocol' (OnClassCondition)
      - @ConditionalOnMissingBean (types: org.springframework.boot.web.servlet.server.ServletWebServerFactory; SearchStrategy: current) did not find any beans (OnBeanCondition)

   SimpleCacheConfiguration matched:
      - Cache org.springframework.boot.autoconfigure.cache.SimpleCacheConfiguration automatic cache type (CacheCondition)

   SpringBootWebSecurityConfiguration matched:
      - found 'session' scope (OnWebApplicationCondition)

   SpringBootWebSecurityConfiguration.SecurityFilterChainConfiguration matched:
      - AllNestedConditions 2 matched 0 did not; NestedCondition on DefaultWebSecurityCondition.Beans @ConditionalOnMissingBean (types: org.springframework.security.web.SecurityFilterChain; SearchStrategy: all) did not find any beans; NestedCondition on DefaultWebSecurityCondition.Classes @ConditionalOnClass found required classes 'org.springframework.security.web.SecurityFilterChain', 'org.springframework.security.config.annotation.web.builders.HttpSecurity' (DefaultWebSecurityCondition)

   SpringBootWebSecurityConfiguration.WebSecurityEnablerConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.security.config.annotation.web.configuration.EnableWebSecurity' (OnClassCondition)
      - @ConditionalOnMissingBean (names: springSecurityFilterChain; SearchStrategy: all) did not find any beans (OnBeanCondition)

   SpringDataWebAutoConfiguration matched:
      - @ConditionalOnClass found required classes 'org.springframework.data.web.PageableHandlerMethodArgumentResolver', 'org.springframework.web.servlet.config.annotation.WebMvcConfigurer' (OnClassCondition)
      - found 'session' scope (OnWebApplicationCondition)
      - @ConditionalOnMissingBean (types: org.springframework.data.web.PageableHandlerMethodArgumentResolver; SearchStrategy: all) did not find any beans (OnBeanCondition)

   SpringDataWebAutoConfiguration#pageableCustomizer matched:
      - @ConditionalOnMissingBean (types: org.springframework.data.web.config.PageableHandlerMethodArgumentResolverCustomizer; SearchStrategy: all) did not find any beans (OnBeanCondition)

   SpringDataWebAutoConfiguration#sortCustomizer matched:
      - @ConditionalOnMissingBean (types: org.springframework.data.web.config.SortHandlerMethodArgumentResolverCustomizer; SearchStrategy: all) did not find any beans (OnBeanCondition)

   SpringDataWebAutoConfiguration#springDataWebSettings matched:
      - @ConditionalOnMissingBean (types: org.springframework.data.web.config.SpringDataWebSettings; SearchStrategy: all) did not find any beans (OnBeanCondition)

   SqlInitializationAutoConfiguration matched:
      - @ConditionalOnProperty (spring.sql.init.enabled) matched (OnPropertyCondition)
      - NoneNestedConditions 0 matched 1 did not; NestedCondition on SqlInitializationAutoConfiguration.SqlInitializationModeCondition.ModeIsNever @ConditionalOnProperty (spring.sql.init.mode=never) did not find property 'mode' (SqlInitializationAutoConfiguration.SqlInitializationModeCondition)

   SslAutoConfiguration#sslBundleRegistry matched:
      - @ConditionalOnMissingBean (types: org.springframework.boot.ssl.SslBundleRegistry,org.springframework.boot.ssl.SslBundles; SearchStrategy: all) did not find any beans (OnBeanCondition)

   TaskExecutionAutoConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor' (OnClassCondition)

   TaskExecutorConfigurations.SimpleAsyncTaskExecutorBuilderConfiguration#simpleAsyncTaskExecutorBuilder matched:
      - @ConditionalOnMissingBean (types: org.springframework.boot.task.SimpleAsyncTaskExecutorBuilder; SearchStrategy: all) did not find any beans (OnBeanCondition)
      - @ConditionalOnThreading found PLATFORM (OnThreadingCondition)

   TaskExecutorConfigurations.TaskExecutorConfiguration matched:
      - @ConditionalOnMissingBean (types: java.util.concurrent.Executor; SearchStrategy: all) did not find any beans (OnBeanCondition)

   TaskExecutorConfigurations.TaskExecutorConfiguration#applicationTaskExecutor matched:
      - @ConditionalOnThreading found PLATFORM (OnThreadingCondition)

   TaskExecutorConfigurations.ThreadPoolTaskExecutorBuilderConfiguration#threadPoolTaskExecutorBuilder matched:
      - @ConditionalOnMissingBean (types: org.springframework.boot.task.ThreadPoolTaskExecutorBuilder; SearchStrategy: all) did not find any beans (OnBeanCondition)

   TaskSchedulingAutoConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler' (OnClassCondition)

   TaskSchedulingConfigurations.SimpleAsyncTaskSchedulerBuilderConfiguration#simpleAsyncTaskSchedulerBuilder matched:
      - @ConditionalOnMissingBean (types: org.springframework.boot.task.SimpleAsyncTaskSchedulerBuilder; SearchStrategy: all) did not find any beans (OnBeanCondition)
      - @ConditionalOnThreading found PLATFORM (OnThreadingCondition)

   TaskSchedulingConfigurations.ThreadPoolTaskSchedulerBuilderConfiguration#threadPoolTaskSchedulerBuilder matched:
      - @ConditionalOnMissingBean (types: org.springframework.boot.task.ThreadPoolTaskSchedulerBuilder; SearchStrategy: all) did not find any beans (OnBeanCondition)

   TransactionAutoConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.transaction.PlatformTransactionManager' (OnClassCondition)

   TransactionAutoConfiguration.EnableTransactionManagementConfiguration matched:
      - @ConditionalOnBean (types: org.springframework.transaction.TransactionManager; SearchStrategy: all) found bean 'transactionManager'; @ConditionalOnMissingBean (types: org.springframework.transaction.annotation.AbstractTransactionManagementConfiguration; SearchStrategy: all) did not find any beans (OnBeanCondition)

   TransactionAutoConfiguration.EnableTransactionManagementConfiguration.CglibAutoProxyConfiguration matched:
      - @ConditionalOnProperty (spring.aop.proxy-target-class=true) matched (OnPropertyCondition)

   TransactionAutoConfiguration.TransactionTemplateConfiguration matched:
      - @ConditionalOnSingleCandidate (types: org.springframework.transaction.PlatformTransactionManager; SearchStrategy: all) found a single bean 'transactionManager' (OnBeanCondition)

   TransactionAutoConfiguration.TransactionTemplateConfiguration#transactionTemplate matched:
      - @ConditionalOnMissingBean (types: org.springframework.transaction.support.TransactionOperations; SearchStrategy: all) did not find any beans (OnBeanCondition)

   TransactionManagerCustomizationAutoConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.transaction.PlatformTransactionManager' (OnClassCondition)

   TransactionManagerCustomizationAutoConfiguration#platformTransactionManagerCustomizers matched:
      - @ConditionalOnMissingBean (types: org.springframework.boot.autoconfigure.transaction.TransactionManagerCustomizers; SearchStrategy: all) did not find any beans (OnBeanCondition)

   UserDetailsServiceAutoConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.security.authentication.AuthenticationManager' (OnClassCondition)
      - found 'session' scope (OnWebApplicationCondition)
      - AnyNestedCondition 1 matched 2 did not; NestedCondition on UserDetailsServiceAutoConfiguration.MissingAlternativeOrUserPropertiesConfigured.PasswordConfigured @ConditionalOnProperty (spring.security.user.password) did not find property 'password'; NestedCondition on UserDetailsServiceAutoConfiguration.MissingAlternativeOrUserPropertiesConfigured.NameConfigured @ConditionalOnProperty (spring.security.user.name) did not find property 'name'; NestedCondition on UserDetailsServiceAutoConfiguration.MissingAlternativeOrUserPropertiesConfigured.MissingAlternative @ConditionalOnMissingClass did not find unwanted classes 'org.springframework.security.oauth2.client.registration.ClientRegistrationRepository', 'org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector', 'org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrationRepository' (UserDetailsServiceAutoConfiguration.MissingAlternativeOrUserPropertiesConfigured)
      - @ConditionalOnBean (types: org.springframework.security.config.ObjectPostProcessor; SearchStrategy: all) found beans 'objectPostProcessor', 'webAuthorizationManagerPostProcessor', 'filterChainDecoratorPostProcessor', 'authenticationManagerPostProcessor'; @ConditionalOnMissingBean (types: org.springframework.security.authentication.AuthenticationManager,org.springframework.security.authentication.AuthenticationProvider,org.springframework.security.core.userdetails.UserDetailsService,org.springframework.security.authentication.AuthenticationManagerResolver,org.springframework.security.oauth2.jwt.JwtDecoder; SearchStrategy: all) did not find any beans (OnBeanCondition)

   ValidationAutoConfiguration matched:
      - @ConditionalOnClass found required class 'jakarta.validation.executable.ExecutableValidator' (OnClassCondition)
      - @ConditionalOnResource found location classpath:META-INF/services/jakarta.validation.spi.ValidationProvider (OnResourceCondition)

   ValidationAutoConfiguration#defaultValidator matched:
      - @ConditionalOnMissingBean (types: jakarta.validation.Validator; SearchStrategy: all) did not find any beans (OnBeanCondition)

   ValidationAutoConfiguration#methodValidationPostProcessor matched:
      - @ConditionalOnMissingBean (types: org.springframework.validation.beanvalidation.MethodValidationPostProcessor; SearchStrategy: current) did not find any beans (OnBeanCondition)

   WebMvcAutoConfiguration matched:
      - @ConditionalOnClass found required classes 'jakarta.servlet.Servlet', 'org.springframework.web.servlet.DispatcherServlet', 'org.springframework.web.servlet.config.annotation.WebMvcConfigurer' (OnClassCondition)
      - found 'session' scope (OnWebApplicationCondition)
      - @ConditionalOnMissingBean (types: org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport; SearchStrategy: all) did not find any beans (OnBeanCondition)

   WebMvcAutoConfiguration#formContentFilter matched:
      - @ConditionalOnProperty (spring.mvc.formcontent.filter.enabled) matched (OnPropertyCondition)
      - @ConditionalOnMissingBean (types: org.springframework.web.filter.FormContentFilter; SearchStrategy: all) did not find any beans (OnBeanCondition)

   WebMvcAutoConfiguration.EnableWebMvcConfiguration#flashMapManager matched:
      - @ConditionalOnMissingBean (names: flashMapManager; SearchStrategy: all) did not find any beans (OnBeanCondition)

   WebMvcAutoConfiguration.EnableWebMvcConfiguration#localeResolver matched:
      - @ConditionalOnMissingBean (names: localeResolver; SearchStrategy: all) did not find any beans (OnBeanCondition)

   WebMvcAutoConfiguration.EnableWebMvcConfiguration#themeResolver matched:
      - @ConditionalOnMissingBean (names: themeResolver; SearchStrategy: all) did not find any beans (OnBeanCondition)

   WebMvcAutoConfiguration.EnableWebMvcConfiguration#viewNameTranslator matched:
      - @ConditionalOnMissingBean (names: viewNameTranslator; SearchStrategy: all) did not find any beans (OnBeanCondition)

   WebMvcAutoConfiguration.WebMvcAutoConfigurationAdapter#defaultViewResolver matched:
      - @ConditionalOnMissingBean (types: org.springframework.web.servlet.view.InternalResourceViewResolver; SearchStrategy: all) did not find any beans (OnBeanCondition)

   WebMvcAutoConfiguration.WebMvcAutoConfigurationAdapter#requestContextFilter matched:
      - @ConditionalOnMissingBean (types: org.springframework.web.context.request.RequestContextListener,org.springframework.web.filter.RequestContextFilter; SearchStrategy: all) did not find any beans (OnBeanCondition)

   WebMvcAutoConfiguration.WebMvcAutoConfigurationAdapter#viewResolver matched:
      - @ConditionalOnBean (types: org.springframework.web.servlet.ViewResolver; SearchStrategy: all) found beans 'defaultViewResolver', 'beanNameViewResolver', 'mvcViewResolver'; @ConditionalOnMissingBean (names: viewResolver types: org.springframework.web.servlet.view.ContentNegotiatingViewResolver; SearchStrategy: all) did not find any beans (OnBeanCondition)

   WebSocketServletAutoConfiguration matched:
      - @ConditionalOnClass found required classes 'jakarta.servlet.Servlet', 'jakarta.websocket.server.ServerContainer' (OnClassCondition)
      - found 'session' scope (OnWebApplicationCondition)

   WebSocketServletAutoConfiguration.TomcatWebSocketConfiguration matched:
      - @ConditionalOnClass found required classes 'org.apache.catalina.startup.Tomcat', 'org.apache.tomcat.websocket.server.WsSci' (OnClassCondition)

   WebSocketServletAutoConfiguration.TomcatWebSocketConfiguration#websocketServletWebServerCustomizer matched:
      - @ConditionalOnMissingBean (names: websocketServletWebServerCustomizer; SearchStrategy: all) did not find any beans (OnBeanCondition)


Negative matches:
-----------------

   ActiveMQAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'jakarta.jms.ConnectionFactory' (OnClassCondition)

   AopAutoConfiguration.AspectJAutoProxyingConfiguration.JdkDynamicAutoProxyConfiguration:
      Did not match:
         - @ConditionalOnProperty (spring.aop.proxy-target-class=false) did not find property 'proxy-target-class' (OnPropertyCondition)

   AopAutoConfiguration.ClassProxyingConfiguration:
      Did not match:
         - @ConditionalOnMissingClass found unwanted class 'org.aspectj.weaver.Advice' (OnClassCondition)

   ArtemisAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'jakarta.jms.ConnectionFactory' (OnClassCondition)

   BatchAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.batch.core.launch.JobLauncher' (OnClassCondition)

   Cache2kCacheConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.cache2k.Cache2kBuilder' (OnClassCondition)

   CacheAutoConfiguration:
      Did not match:
         - @ConditionalOnBean (types: org.springframework.cache.interceptor.CacheAspectSupport; SearchStrategy: all) did not find any beans of type org.springframework.cache.interceptor.CacheAspectSupport (OnBeanCondition)
      Matched:
         - @ConditionalOnClass found required class 'org.springframework.cache.CacheManager' (OnClassCondition)

   CacheAutoConfiguration.CacheManagerEntityManagerFactoryDependsOnPostProcessor:
      Did not match:
         - Ancestor org.springframework.boot.autoconfigure.cache.CacheAutoConfiguration did not match (ConditionEvaluationReport.AncestorsMatchedCondition)
      Matched:
         - @ConditionalOnClass found required class 'org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean' (OnClassCondition)

   CaffeineCacheConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.github.benmanes.caffeine.cache.Caffeine' (OnClassCondition)

   CassandraAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.datastax.oss.driver.api.core.CqlSession' (OnClassCondition)

   CassandraDataAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.datastax.oss.driver.api.core.CqlSession' (OnClassCondition)

   CassandraReactiveDataAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.datastax.oss.driver.api.core.CqlSession' (OnClassCondition)

   CassandraReactiveRepositoriesAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.data.cassandra.ReactiveSession' (OnClassCondition)

   CassandraRepositoriesAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.datastax.oss.driver.api.core.CqlSession' (OnClassCondition)

   ClientHttpConnectorAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.web.reactive.function.client.WebClient' (OnClassCondition)

   CodecsAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.web.reactive.function.client.WebClient' (OnClassCondition)

   CouchbaseAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.couchbase.client.java.Cluster' (OnClassCondition)

   CouchbaseCacheConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.couchbase.client.java.Cluster' (OnClassCondition)

   CouchbaseDataAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.couchbase.client.java.Bucket' (OnClassCondition)

   CouchbaseReactiveDataAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.couchbase.client.java.Cluster' (OnClassCondition)

   CouchbaseReactiveRepositoriesAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.couchbase.client.java.Cluster' (OnClassCondition)

   CouchbaseRepositoriesAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.couchbase.client.java.Bucket' (OnClassCondition)

   DataSourceAutoConfiguration.EmbeddedDatabaseConfiguration:
      Did not match:
         - EmbeddedDataSource found supported pooled data source (DataSourceAutoConfiguration.EmbeddedDatabaseCondition)

   DataSourceCheckpointRestoreConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.crac.Resource' (OnClassCondition)

   DataSourceConfiguration.Dbcp2:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.apache.commons.dbcp2.BasicDataSource' (OnClassCondition)

   DataSourceConfiguration.Generic:
      Did not match:
         - @ConditionalOnProperty (spring.datasource.type) did not find property 'spring.datasource.type' (OnPropertyCondition)

   DataSourceConfiguration.OracleUcp:
      Did not match:
         - @ConditionalOnClass did not find required classes 'oracle.ucp.jdbc.PoolDataSourceImpl', 'oracle.jdbc.OracleConnection' (OnClassCondition)

   DataSourceConfiguration.Tomcat:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.apache.tomcat.jdbc.pool.DataSource' (OnClassCondition)

   DataSourceJmxConfiguration:
      Did not match:
         - @ConditionalOnProperty (spring.jmx.enabled=true) found different value in property 'enabled' (OnPropertyCondition)

   DataSourcePoolMetadataProvidersConfiguration.CommonsDbcp2PoolDataSourceMetadataProviderConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.apache.commons.dbcp2.BasicDataSource' (OnClassCondition)

   DataSourcePoolMetadataProvidersConfiguration.OracleUcpPoolDataSourceMetadataProviderConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required classes 'oracle.ucp.jdbc.PoolDataSource', 'oracle.jdbc.OracleConnection' (OnClassCondition)

   DataSourcePoolMetadataProvidersConfiguration.TomcatDataSourcePoolMetadataProviderConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.apache.tomcat.jdbc.pool.DataSource' (OnClassCondition)

   DataSourceTransactionManagerAutoConfiguration.JdbcTransactionManagerConfiguration#transactionManager:
      Did not match:
         - @ConditionalOnMissingBean (types: org.springframework.transaction.TransactionManager; SearchStrategy: all) found beans of type 'org.springframework.transaction.TransactionManager' transactionManager (OnBeanCondition)

   DevToolsDataSourceAutoConfiguration:
      Did not match:
         - Devtools devtools is disabled for current context. (OnEnabledDevToolsCondition)
      Matched:
         - @ConditionalOnClass found required class 'javax.sql.DataSource' (OnClassCondition)

   DevToolsR2dbcAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'io.r2dbc.spi.ConnectionFactory' (OnClassCondition)

   DispatcherServletAutoConfiguration.DispatcherServletConfiguration#multipartResolver:
      Did not match:
         - @ConditionalOnBean (types: org.springframework.web.multipart.MultipartResolver; SearchStrategy: all) did not find any beans of type org.springframework.web.multipart.MultipartResolver (OnBeanCondition)

   ElasticsearchClientAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'co.elastic.clients.elasticsearch.ElasticsearchClient' (OnClassCondition)

   ElasticsearchDataAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate' (OnClassCondition)

   ElasticsearchRepositoriesAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.data.elasticsearch.repository.ElasticsearchRepository' (OnClassCondition)

   ElasticsearchRestClientAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.elasticsearch.client.RestClientBuilder' (OnClassCondition)

   EmbeddedLdapAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.unboundid.ldap.listener.InMemoryDirectoryServer' (OnClassCondition)

   EmbeddedWebServerFactoryCustomizerAutoConfiguration:
      Did not match:
         - Application is deployed as a WAR file. (OnWarDeploymentCondition)
      Matched:
         - @ConditionalOnWebApplication (required) found 'session' scope (OnWebApplicationCondition)

   ErrorWebFluxAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.web.reactive.config.WebFluxConfigurer' (OnClassCondition)

   FlywayAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.flywaydb.core.Flyway' (OnClassCondition)

   FreeMarkerAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'freemarker.template.Configuration' (OnClassCondition)

   GraphQlAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'graphql.GraphQL' (OnClassCondition)

   GraphQlQueryByExampleAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'graphql.GraphQL' (OnClassCondition)

   GraphQlQuerydslAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.querydsl.core.Query' (OnClassCondition)

   GraphQlRSocketAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'graphql.GraphQL' (OnClassCondition)

   GraphQlReactiveQueryByExampleAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'graphql.GraphQL' (OnClassCondition)

   GraphQlReactiveQuerydslAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.querydsl.core.Query' (OnClassCondition)

   GraphQlWebFluxAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'graphql.GraphQL' (OnClassCondition)

   GraphQlWebFluxSecurityAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'graphql.GraphQL' (OnClassCondition)

   GraphQlWebMvcAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'graphql.GraphQL' (OnClassCondition)

   GraphQlWebMvcSecurityAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'graphql.GraphQL' (OnClassCondition)

   GroovyTemplateAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'groovy.text.markup.MarkupTemplateEngine' (OnClassCondition)

   GsonAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.google.gson.Gson' (OnClassCondition)

   GsonHttpMessageConvertersConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.google.gson.Gson' (OnClassCondition)

   H2ConsoleAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.h2.server.web.JakartaWebServlet' (OnClassCondition)

   HazelcastAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.hazelcast.core.HazelcastInstance' (OnClassCondition)

   HazelcastCacheConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.hazelcast.core.HazelcastInstance' (OnClassCondition)

   HazelcastJpaDependencyAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.hazelcast.core.HazelcastInstance' (OnClassCondition)

   HttpHandlerAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.web.reactive.DispatcherHandler' (OnClassCondition)

   HypermediaAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.hateoas.EntityModel' (OnClassCondition)

   InfinispanCacheConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.infinispan.spring.embedded.provider.SpringEmbeddedCacheManager' (OnClassCondition)

   IntegrationAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.integration.config.EnableIntegration' (OnClassCondition)

   JCacheCacheConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'javax.cache.Caching' (OnClassCondition)

   JacksonHttpMessageConvertersConfiguration.MappingJackson2XmlHttpMessageConverterConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.fasterxml.jackson.dataformat.xml.XmlMapper' (OnClassCondition)

   JdbcRepositoriesAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.data.jdbc.repository.config.AbstractJdbcConfiguration' (OnClassCondition)

   JerseyAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.glassfish.jersey.server.spring.SpringComponentProvider' (OnClassCondition)

   JmsAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'jakarta.jms.Message' (OnClassCondition)

   JmxAutoConfiguration:
      Did not match:
         - @ConditionalOnProperty (spring.jmx.enabled=true) found different value in property 'enabled' (OnPropertyCondition)
      Matched:
         - @ConditionalOnClass found required class 'org.springframework.jmx.export.MBeanExporter' (OnClassCondition)

   JndiConnectionFactoryAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.jms.core.JmsTemplate' (OnClassCondition)

   JndiDataSourceAutoConfiguration:
      Did not match:
         - @ConditionalOnProperty (spring.datasource.jndi-name) did not find property 'jndi-name' (OnPropertyCondition)
      Matched:
         - @ConditionalOnClass found required classes 'javax.sql.DataSource', 'org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType' (OnClassCondition)

   JndiJtaConfiguration:
      Did not match:
         - @ConditionalOnJndi JNDI environment is not available (OnJndiCondition)
      Matched:
         - @ConditionalOnClass found required class 'org.springframework.transaction.jta.JtaTransactionManager' (OnClassCondition)

   JooqAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.jooq.DSLContext' (OnClassCondition)

   JpaRepositoriesAutoConfiguration#entityManagerFactoryBootstrapExecutorCustomizer:
      Did not match:
         - AnyNestedCondition 0 matched 2 did not; NestedCondition on JpaRepositoriesAutoConfiguration.BootstrapExecutorCondition.LazyBootstrapMode @ConditionalOnProperty (spring.data.jpa.repositories.bootstrap-mode=lazy) did not find property 'bootstrap-mode'; NestedCondition on JpaRepositoriesAutoConfiguration.BootstrapExecutorCondition.DeferredBootstrapMode @ConditionalOnProperty (spring.data.jpa.repositories.bootstrap-mode=deferred) did not find property 'bootstrap-mode' (JpaRepositoriesAutoConfiguration.BootstrapExecutorCondition)

   JsonbAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'jakarta.json.bind.Jsonb' (OnClassCondition)

   JsonbHttpMessageConvertersConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'jakarta.json.bind.Jsonb' (OnClassCondition)

   KafkaAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.kafka.core.KafkaTemplate' (OnClassCondition)

   LdapAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.ldap.core.ContextSource' (OnClassCondition)

   LdapRepositoriesAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.data.ldap.repository.LdapRepository' (OnClassCondition)

   LiquibaseAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'liquibase.change.DatabaseChange' (OnClassCondition)

   LocalDevToolsAutoConfiguration:
      Did not match:
         - Initialized Restarter Condition initialized without URLs (OnInitializedRestarterCondition)

   MailSenderAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'jakarta.mail.internet.MimeMessage' (OnClassCondition)

   MailSenderValidatorAutoConfiguration:
      Did not match:
         - @ConditionalOnSingleCandidate did not find required type 'org.springframework.mail.javamail.JavaMailSenderImpl' (OnBeanCondition)

   MessageSourceAutoConfiguration:
      Did not match:
         - ResourceBundle did not find bundle with basename messages (MessageSourceAutoConfiguration.ResourceBundleCondition)

   MongoAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.mongodb.client.MongoClient' (OnClassCondition)

   MongoDataAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.mongodb.client.MongoClient' (OnClassCondition)

   MongoReactiveAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.mongodb.reactivestreams.client.MongoClient' (OnClassCondition)

   MongoReactiveDataAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.mongodb.reactivestreams.client.MongoClient' (OnClassCondition)

   MongoReactiveRepositoriesAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.mongodb.reactivestreams.client.MongoClient' (OnClassCondition)

   MongoRepositoriesAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.mongodb.client.MongoClient' (OnClassCondition)

   MustacheAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.samskivert.mustache.Mustache' (OnClassCondition)

   Neo4jAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.neo4j.driver.Driver' (OnClassCondition)

   Neo4jDataAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.neo4j.driver.Driver' (OnClassCondition)

   Neo4jReactiveDataAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.neo4j.driver.Driver' (OnClassCondition)

   Neo4jReactiveRepositoriesAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.neo4j.driver.Driver' (OnClassCondition)

   Neo4jRepositoriesAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.neo4j.driver.Driver' (OnClassCondition)

   NettyAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'io.netty.util.NettyRuntime' (OnClassCondition)

   OAuth2AuthorizationServerAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.security.oauth2.server.authorization.OAuth2Authorization' (OnClassCondition)

   OAuth2AuthorizationServerJwtAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.security.oauth2.server.authorization.OAuth2Authorization' (OnClassCondition)

   OAuth2ClientAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.security.oauth2.client.registration.ClientRegistration' (OnClassCondition)

   OAuth2ResourceServerAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthenticationToken' (OnClassCondition)

   ProjectInfoAutoConfiguration#buildProperties:
      Did not match:
         - @ConditionalOnResource did not find resource '${spring.info.build.location:classpath:META-INF/build-info.properties}' (OnResourceCondition)

   ProjectInfoAutoConfiguration#gitProperties:
      Did not match:
         - GitResource did not find git info at classpath:git.properties (ProjectInfoAutoConfiguration.GitResourceAvailableCondition)

   PulsarAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.apache.pulsar.client.api.PulsarClient' (OnClassCondition)

   PulsarReactiveAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.apache.pulsar.client.api.PulsarClient' (OnClassCondition)

   QuartzAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.quartz.Scheduler' (OnClassCondition)

   R2dbcAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'io.r2dbc.spi.ConnectionFactory' (OnClassCondition)

   R2dbcDataAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.data.r2dbc.core.R2dbcEntityTemplate' (OnClassCondition)

   R2dbcInitializationConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required classes 'io.r2dbc.spi.ConnectionFactory', 'org.springframework.r2dbc.connection.init.DatabasePopulator' (OnClassCondition)

   R2dbcProxyAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'io.r2dbc.proxy.ProxyConnectionFactory' (OnClassCondition)

   R2dbcRepositoriesAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'io.r2dbc.spi.ConnectionFactory' (OnClassCondition)

   R2dbcTransactionManagerAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.r2dbc.connection.R2dbcTransactionManager' (OnClassCondition)

   RSocketGraphQlClientAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'graphql.GraphQL' (OnClassCondition)

   RSocketMessagingAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'io.rsocket.RSocket' (OnClassCondition)

   RSocketRequesterAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'io.rsocket.RSocket' (OnClassCondition)

   RSocketSecurityAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.security.rsocket.core.SecuritySocketAcceptorInterceptor' (OnClassCondition)

   RSocketServerAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'io.rsocket.core.RSocketServer' (OnClassCondition)

   RSocketStrategiesAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'io.netty.buffer.PooledByteBufAllocator' (OnClassCondition)

   RabbitAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.rabbitmq.client.Channel' (OnClassCondition)

   ReactiveElasticsearchClientAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'co.elastic.clients.transport.ElasticsearchTransport' (OnClassCondition)

   ReactiveElasticsearchRepositoriesAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'reactor.core.publisher.Mono' (OnClassCondition)

   ReactiveMultipartAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.web.reactive.config.WebFluxConfigurer' (OnClassCondition)

   ReactiveOAuth2ClientAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'reactor.core.publisher.Flux' (OnClassCondition)

   ReactiveOAuth2ResourceServerAutoConfiguration:
      Did not match:
         - @ConditionalOnWebApplication did not find reactive web application classes (OnWebApplicationCondition)

   ReactiveSecurityAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'reactor.core.publisher.Flux' (OnClassCondition)

   ReactiveUserDetailsServiceAutoConfiguration:
      Did not match:
         - AnyNestedCondition 0 matched 2 did not; NestedCondition on ReactiveUserDetailsServiceAutoConfiguration.RSocketEnabledOrReactiveWebApplication.ReactiveWebApplicationCondition did not find reactive web application classes; NestedCondition on ReactiveUserDetailsServiceAutoConfiguration.RSocketEnabledOrReactiveWebApplication.RSocketSecurityEnabledCondition @ConditionalOnBean (types: org.springframework.messaging.rsocket.annotation.support.RSocketMessageHandler; SearchStrategy: all) did not find any beans of type org.springframework.messaging.rsocket.annotation.support.RSocketMessageHandler (ReactiveUserDetailsServiceAutoConfiguration.RSocketEnabledOrReactiveWebApplication)
      Matched:
         - @ConditionalOnClass found required class 'org.springframework.security.authentication.ReactiveAuthenticationManager' (OnClassCondition)
         - AnyNestedCondition 1 matched 2 did not; NestedCondition on ReactiveUserDetailsServiceAutoConfiguration.MissingAlternativeOrUserPropertiesConfigured.PasswordConfigured @ConditionalOnProperty (spring.security.user.password) did not find property 'password'; NestedCondition on ReactiveUserDetailsServiceAutoConfiguration.MissingAlternativeOrUserPropertiesConfigured.NameConfigured @ConditionalOnProperty (spring.security.user.name) did not find property 'name'; NestedCondition on ReactiveUserDetailsServiceAutoConfiguration.MissingAlternativeOrUserPropertiesConfigured.MissingAlternative @ConditionalOnMissingClass did not find unwanted classes 'org.springframework.security.oauth2.client.registration.ClientRegistrationRepository', 'org.springframework.security.oauth2.server.resource.introspection.ReactiveOpaqueTokenIntrospector' (ReactiveUserDetailsServiceAutoConfiguration.MissingAlternativeOrUserPropertiesConfigured)

   ReactiveWebServerFactoryAutoConfiguration:
      Did not match:
         - @ConditionalOnWebApplication did not find reactive web application classes (OnWebApplicationCondition)

   ReactorAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'reactor.core.publisher.Hooks' (OnClassCondition)

   RedisAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.data.redis.core.RedisOperations' (OnClassCondition)

   RedisCacheConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.data.redis.connection.RedisConnectionFactory' (OnClassCondition)

   RedisReactiveAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'reactor.core.publisher.Flux' (OnClassCondition)

   RedisRepositoriesAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.data.redis.repository.configuration.EnableRedisRepositories' (OnClassCondition)

   RemoteDevToolsAutoConfiguration:
      Did not match:
         - Devtools devtools is disabled for current context. (OnEnabledDevToolsCondition)
      Matched:
         - @ConditionalOnClass found required classes 'jakarta.servlet.Filter', 'org.springframework.http.server.ServerHttpRequest' (OnClassCondition)
         - @ConditionalOnProperty (spring.devtools.remote.secret) matched (OnPropertyCondition)

   RepositoryRestMvcAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.data.rest.webmvc.config.RepositoryRestMvcConfiguration' (OnClassCondition)

   Saml2RelyingPartyAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrationRepository' (OnClassCondition)

   SecurityDataConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.security.data.repository.query.SecurityEvaluationContextExtension' (OnClassCondition)

   SendGridAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.sendgrid.SendGrid' (OnClassCondition)

   ServletWebServerFactoryAutoConfiguration.ForwardedHeaderFilterConfiguration:
      Did not match:
         - @ConditionalOnProperty (server.forward-headers-strategy=framework) did not find property 'server.forward-headers-strategy' (OnPropertyCondition)

   ServletWebServerFactoryConfiguration.EmbeddedJetty:
      Did not match:
         - @ConditionalOnClass did not find required classes 'org.eclipse.jetty.server.Server', 'org.eclipse.jetty.util.Loader', 'org.eclipse.jetty.ee10.webapp.WebAppContext' (OnClassCondition)

   ServletWebServerFactoryConfiguration.EmbeddedUndertow:
      Did not match:
         - @ConditionalOnClass did not find required classes 'io.undertow.Undertow', 'org.xnio.SslClientAuthMode' (OnClassCondition)

   SessionAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.session.Session' (OnClassCondition)

   SpringApplicationAdminJmxAutoConfiguration:
      Did not match:
         - @ConditionalOnProperty (spring.application.admin.enabled=true) did not find property 'enabled' (OnPropertyCondition)

   TaskExecutorConfigurations.SimpleAsyncTaskExecutorBuilderConfiguration#simpleAsyncTaskExecutorBuilderVirtualThreads:
      Did not match:
         - @ConditionalOnMissingBean (types: org.springframework.boot.task.SimpleAsyncTaskExecutorBuilder; SearchStrategy: all) found beans of type 'org.springframework.boot.task.SimpleAsyncTaskExecutorBuilder' simpleAsyncTaskExecutorBuilder (OnBeanCondition)

   TaskExecutorConfigurations.TaskExecutorConfiguration#applicationTaskExecutorVirtualThreads:
      Did not match:
         - @ConditionalOnThreading did not find VIRTUAL (OnThreadingCondition)

   TaskSchedulingAutoConfiguration#scheduledBeanLazyInitializationExcludeFilter:
      Did not match:
         - @ConditionalOnBean (names: org.springframework.context.annotation.internalScheduledAnnotationProcessor; SearchStrategy: all) did not find any beans named org.springframework.context.annotation.internalScheduledAnnotationProcessor (OnBeanCondition)

   TaskSchedulingConfigurations.SimpleAsyncTaskSchedulerBuilderConfiguration#simpleAsyncTaskSchedulerBuilderVirtualThreads:
      Did not match:
         - @ConditionalOnMissingBean (types: org.springframework.boot.task.SimpleAsyncTaskSchedulerBuilder; SearchStrategy: all) found beans of type 'org.springframework.boot.task.SimpleAsyncTaskSchedulerBuilder' simpleAsyncTaskSchedulerBuilder (OnBeanCondition)

   TaskSchedulingConfigurations.TaskSchedulerConfiguration:
      Did not match:
         - @ConditionalOnBean (names: org.springframework.context.annotation.internalScheduledAnnotationProcessor; SearchStrategy: all) did not find any beans named org.springframework.context.annotation.internalScheduledAnnotationProcessor (OnBeanCondition)

   ThymeleafAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.thymeleaf.spring6.SpringTemplateEngine' (OnClassCondition)

   TransactionAutoConfiguration#transactionalOperator:
      Did not match:
         - @ConditionalOnSingleCandidate (types: org.springframework.transaction.ReactiveTransactionManager; SearchStrategy: all) did not find any beans (OnBeanCondition)

   TransactionAutoConfiguration.AspectJTransactionManagementConfiguration:
      Did not match:
         - @ConditionalOnBean (types: org.springframework.transaction.aspectj.AbstractTransactionAspect; SearchStrategy: all) did not find any beans of type org.springframework.transaction.aspectj.AbstractTransactionAspect (OnBeanCondition)

   TransactionAutoConfiguration.EnableTransactionManagementConfiguration.JdkDynamicAutoProxyConfiguration:
      Did not match:
         - @ConditionalOnProperty (spring.aop.proxy-target-class=false) did not find property 'proxy-target-class' (OnPropertyCondition)

   WebClientAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.web.reactive.function.client.WebClient' (OnClassCondition)

   WebFluxAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.web.reactive.config.WebFluxConfigurer' (OnClassCondition)

   WebMvcAutoConfiguration#hiddenHttpMethodFilter:
      Did not match:
         - @ConditionalOnProperty (spring.mvc.hiddenmethod.filter.enabled) did not find property 'enabled' (OnPropertyCondition)

   WebMvcAutoConfiguration.ProblemDetailsErrorHandlingConfiguration:
      Did not match:
         - @ConditionalOnProperty (spring.mvc.problemdetails.enabled=true) did not find property 'enabled' (OnPropertyCondition)

   WebMvcAutoConfiguration.ResourceChainCustomizerConfiguration:
      Did not match:
         - @ConditionalOnEnabledResourceChain did not find class org.webjars.WebJarVersionLocator (OnEnabledResourceChainCondition)

   WebMvcAutoConfiguration.WebMvcAutoConfigurationAdapter#beanNameViewResolver:
      Did not match:
         - @ConditionalOnMissingBean (types: org.springframework.web.servlet.view.BeanNameViewResolver; SearchStrategy: all) found beans of type 'org.springframework.web.servlet.view.BeanNameViewResolver' beanNameViewResolver (OnBeanCondition)

   WebServiceTemplateAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.oxm.Marshaller' (OnClassCondition)

   WebServicesAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.ws.transport.http.MessageDispatcherServlet' (OnClassCondition)

   WebSessionIdResolverAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'reactor.core.publisher.Mono' (OnClassCondition)

   WebSocketMessagingAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer' (OnClassCondition)

   WebSocketReactiveAutoConfiguration:
      Did not match:
         - @ConditionalOnWebApplication did not find reactive web application classes (OnWebApplicationCondition)

   WebSocketServletAutoConfiguration.JettyWebSocketConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.eclipse.jetty.ee10.websocket.jakarta.server.config.JakartaWebSocketServletContainerInitializer' (OnClassCondition)

   WebSocketServletAutoConfiguration.UndertowWebSocketConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'io.undertow.websockets.jsr.Bootstrap' (OnClassCondition)

   XADataSourceAutoConfiguration:
      Did not match:
         - @ConditionalOnBean (types: org.springframework.boot.jdbc.XADataSourceWrapper; SearchStrategy: all) did not find any beans of type org.springframework.boot.jdbc.XADataSourceWrapper (OnBeanCondition)
      Matched:
         - @ConditionalOnClass found required classes 'javax.sql.DataSource', 'jakarta.transaction.TransactionManager', 'org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType' (OnClassCondition)


Exclusions:
-----------

    None


Unconditional classes:
----------------------

    org.springframework.boot.autoconfigure.context.ConfigurationPropertiesAutoConfiguration

    org.springframework.boot.autoconfigure.ssl.SslAutoConfiguration

    org.springframework.boot.autoconfigure.context.LifecycleAutoConfiguration

    org.springframework.boot.autoconfigure.context.PropertyPlaceholderAutoConfiguration

    org.springframework.boot.autoconfigure.availability.ApplicationAvailabilityAutoConfiguration

    org.springframework.boot.autoconfigure.info.ProjectInfoAutoConfiguration



]]></system-err>
  </testcase>
</testsuite>
```

--- 

## `sub-manager-backend/target/test-classes/pl/gabgal/submanager/backend/SubManagerBackendApplicationTests.class`

```
   A 
      java/lang/Object <init> ()V  >pl/gabgal/submanager/backend/SubManagerBackendApplicationTests Code LineNumberTable LocalVariableTable this @Lpl/gabgal/submanager/backend/SubManagerBackendApplicationTests; contextLoads RuntimeVisibleAnnotations Lorg/junit/jupiter/api/Test; 
SourceFile &SubManagerBackendApplicationTests.java 6Lorg/springframework/boot/test/context/SpringBootTest;               	   /     *     
                 
        	   +          
                 
                        
```

--- 

## `sub-manager-front-end/.dockerignore`

```
Dockerfile.*
.dockerignore
node_modules
npm-debug.log
README.md
.next
.git
```

--- 

## `sub-manager-front-end/components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "gray",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

--- 

## `sub-manager-front-end/Dockerfile.dev`

```
FROM node:21.7.3-alpine

WORKDIR /app

COPY package.json .

RUN npm install --include=dev

COPY --chown=app:app . /app

COPY . .

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "dev" ]
```

--- 

## `sub-manager-front-end/Dockerfile.prod`

```
# Etap budowania
FROM node:21.5.0-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etap produkcyjny
FROM node:21.5.0-alpine

WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

--- 

## `sub-manager-front-end/jest.config.ts`

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'
 
const createJestConfig = nextJest({
  dir: './',
})
 
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}
export default createJestConfig(config)
```

--- 

## `sub-manager-front-end/jest.setup.ts`

```typescript
import '@testing-library/jest-dom';

```

--- 

## `sub-manager-front-end/next-env.d.ts`

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

```

--- 

## `sub-manager-front-end/package.json`

```json
{
  "name": "sub-manager-front-end",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/modifiers": "^9.0.0",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@hookform/resolvers": "^5.1.1",
    "@radix-ui/react-alert-dialog": "^1.1.14",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-popover": "^1.1.14",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-toggle": "^1.1.9",
    "@radix-ui/react-toggle-group": "^1.1.10",
    "@radix-ui/react-tooltip": "^1.2.7",
    "@tanstack/react-table": "^8.21.3",
    "chart.js": "^4.4.9",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.525.0",
    "next": "15.1.6",
    "next-themes": "^0.4.6",
    "react": "^19.0.0",
    "react-day-picker": "^9.8.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.60.0",
    "recharts": "^2.15.4",
    "sonner": "^2.0.6",
    "tailwind-merge": "^3.3.1",
    "vaul": "^1.1.2",
    "zod": "^4.0.5"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.2.0",
    "@types/jest": "^29.5.14",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.1.6",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "postcss": "^8",
    "sass": "^1.85.1",
    "tailwindcss": "^3.4.1",
    "tailwindcss-animate": "^1.0.7",
    "ts-node": "^10.9.2",
    "typescript": "^5"
  }
}

```

--- 

## `sub-manager-front-end/postcss.config.mjs`

```
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;

```

--- 

## `sub-manager-front-end/README.md`

```markdown
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

--- 

## `sub-manager-front-end/tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

```

--- 

## `sub-manager-front-end/src/middleware.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {

    const token = req.cookies.get('JWT')?.value;
    const { pathname } = req.nextUrl;

    const protectedRoutes = ["/dashboard"]; 
    const authRoute = "/auth";      

    if (protectedRoutes.includes(pathname) && !token) {
        return NextResponse.redirect(new URL("/auth", req.url));
    }

    if (authRoute === pathname && token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

```

--- 

## `sub-manager-front-end/src/types.ts`

```typescript
export interface Subscription {
  subscriptionId: number
  title: string
  description: string
  price: number
  cycle: string
  dateOfLastPayment: string
  currencyId: number
}

export enum Status {
  PAID,
  UNPROCESSED
}

export interface Payment {
  paymentId: number,
  status: Status,
  dateOfPayment: string,
  subscriptionId: number
}
```

--- 

## `sub-manager-front-end/src/app/favicon.ico`

```
               (       ,             #.  #.          bi*\;hi,],]+\;ig*\.^,],]+\:hi{\o\og*[+\0`rKu*[*\:h'}@q/r0*[+\._Is*[*\:h*Cs2t3r/_Jt,],]8g*Cs2t36d,]*[;i,Et4u5n/_-^-^+Dt3u4U|k*\+\/`*Cs2t3Bn(Z=jm*[+\-^*Cs2t3Am*[*[@lv*\-^*Cs2t3Bn*\*[@lwƫƫǬɰʲ%|>u4u5Bn*\,]Cnǭs1s2s2u4w7t3t3t3t3n+\,]*[eǭt2t3s2s1u4r0r0r0r0q+\,].^~Co;iȯt2s2)~BWk\oYlYlYlYll*\+],]}Dp*[(ZOx̴u4s1Rfj*\+].^gFq*[*[=jηv7t4Vjk*\,]*\,]+\>jt3r0Sgn+\,]*\?kdw"z<&|?&|?'}@'}@&|?&|?&|?!y;t3r0Sgs+\?lYmq/s2s2t3t3s2s2s2t2t3r0SgoZnr0t3t3u4u4t3t3t3u4u5s2Ui                                                                                        
```

--- 

## `sub-manager-front-end/src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@media (prefers-color-scheme: dark) {
  :root {
    --primary: #5dd62c;
    --secondary: #337418;
    --accent: #202020;
    --accent-secondary: #444444;
    --text-dim: #a0a0a0;
  }
}


.text-secondary {
  color: var(--text-dim);
}

.text-opposite {
  color: var(--accent);
}

header {
  width: 100vw;
  height: 10vh;
}

.header-links--link__featured {
  border: solid 2px var(--secondary);
  border-radius: 25px;
}

main {
  width: 100vw;
  height: 85vh;
}

.button {
  background-color: var(--primary);
  padding: 10px;
  border-radius: 5px;
  min-width: 150px;
  box-shadow: 0px 3px 20px 4px var(--secondary);
  transition: all 0.3s ease;
  text-align: center;
}

.button:hover {
  box-shadow: 0px 3px 20px 8px var(--secondary);
}

.button-secondary {
  background-color: var(--secondary);
  padding: 10px 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button-secondary:hover {
  background-color: var(--primary);
}


.landing-img {
  width: 65%;
}

footer {
  width: 100vw;
  height: 5vh;
}

/* Wybrany dzień */
.rdp-day[data-selected-single="true"] {
  background-color: var(--primary) !important;
  color: white !important;
  border-radius: 0.375rem !important; /* dopasuj jeśli chcesz */
}

/* Hover nad wybranym dniem */
.rdp-day[data-selected-single="true"]:hover {
  background-color: var(--secondary) !important;
  color: white !important;
  border-radius: 0.375rem !important;
}

/* Hover nad wszystkimi dniami */
.rdp-day:hover {
  background-color: var(--secondary) !important;
  color: white !important;
  border-radius: 0.375rem !important;
}



@layer base {
  :root {
    --background: 0 0% 12.5%;
    --foreground: 224 71.4% 4.1%;
    --card: 0 0% 100%;
    --card-foreground: 224 71.4% 4.1%;
    --popover: 0 0% 100%;
    --popover-foreground: 224 71.4% 4.1%;
    --primary: 220.9 39.3% 11%;
    --primary-foreground: 210 20% 98%;
    --secondary: 220 14.3% 95.9%;
    --secondary-foreground: 220.9 39.3% 11%;
    --muted: 220 14.3% 95.9%;
    --muted-foreground: 220 8.9% 46.1%;
    --accent: 220 14.3% 95.9%;
    --accent-foreground: 220.9 39.3% 11%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 20% 98%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 224 71.4% 4.1%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
  .dark {
    --background: 0 0% 1%;
    --foreground: 210 20% 98%;
    --card: 224 71.4% 4.1%;
    --card-foreground: 210 20% 98%;
    --popover: 224 71.4% 4.1%;
    --popover-foreground: 210 20% 98%;
    --primary: 210 20% 98%;
    --primary-foreground: 220.9 39.3% 11%;
    --secondary: 215 27.9% 16.9%;
    --secondary-foreground: 210 20% 98%;
    --muted: 215 27.9% 16.9%;
    --muted-foreground: 217.9 10.6% 64.9%;
    --accent: 215 27.9% 16.9%;
    --accent-foreground: 210 20% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 20% 98%;
    --border: 215 27.9% 16.9%;
    --input: 215 27.9% 16.9%;
    --ring: 216 12.2% 83.9%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}



@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

--- 

## `sub-manager-front-end/src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SubManager",
  description: "Your way of managing subscriptions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

```

--- 

## `sub-manager-front-end/src/app/page.tsx`

```tsx
"use client"

import Footer from "@/components/footer/Footer"
import Header from "@/components/header/Header"
import Link from "next/link"

export default function LandingPage() {
  return (
    <>
      <Header />

      <main className="flex flex-col justify-center items-center w-full min-h-full text-center">
        <h1 className="font-bold mb-2 text-lg md:text-2xl lg:text-4xl">Effortless Subscription Management</h1>
        <p className="mb-5 text-base md:text-lg lg:text-xl text-secondary">Save time and money by managing all your subscriptions in one place.</p>
        <div className="mb-12">
          <button className="button">
            <Link href="/auth">
              Get Started
            </Link>
          </button>
        </div>

        <img className="landing-img hidden md:block" src="./landing-placeholder-dim.png" alt="Image showing dashboard of the app." />
      </main>

      <Footer />
    </>
  )
}

```

--- 

## `sub-manager-front-end/src/app/auth/page.tsx`

```tsx
"use client"

import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import { useEffect, useState } from "react"

enum AuthType {
  LOGIN,
  REGISTER
}

interface InputErrors {
  username: string;
  password: string;
  email: string;
}

const usernameRegex: RegExp = /^[a-zA-Z0-9]{4,}$/;
const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,16}$/;

export default function Auth() {
  const [authType, setAuthType] = useState<AuthType>(getAuthType())
  const [error, setError] = useState<InputErrors>({
    username: "",
    password: "",
    email: "",
  })
  const [serverError, setServerError] = useState<string>("")
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  })

  function getAuthType(): AuthType {
    if (typeof window !== "undefined" && localStorage.getItem("haveLoggedIn")) {
      return AuthType.LOGIN;
    }
    return AuthType.REGISTER;
  }

  function changeAuthType() {
    setAuthType(prev => prev === AuthType.REGISTER ? AuthType.LOGIN : AuthType.REGISTER)
    setServerError("") // wyczyść błędy przy zmianie trybu
  }

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "username":
        return usernameRegex.test(value)
          ? ""
          : "Username must be at least 4 alphanumeric characters";
      case "password":
        return passwordRegex.test(value)
          ? ""
          : "Password must be 6–16 chars with uppercase, lowercase, number, and special character";
      case "email":
        return authType === AuthType.REGISTER && !emailRegex.test(value)
          ? "Invalid email format"
          : "";
      default:
        return "";
    }
  }

  const checkForErrors = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const errorMessage = validateField(name, value)

    setError(prev => ({
      ...prev,
      [name]: errorMessage
    }))
  }

  function clearError(e: React.FocusEvent<HTMLInputElement>) {
    const { name } = e.target;
    setError((prev) => ({ ...prev, [name]: "" }));
    setServerError("") // czyść globalny błąd po focusie
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError("") // resetuj błędy z backendu

    try {
      const endpoint = "http://localhost:8080/api/auth/" + (authType === AuthType.REGISTER ? "register" : "login");

      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (authType === AuthType.LOGIN) {
          setServerError("Invalid login or password");
        } else {
          setServerError("Registration failed — please check your data");
        }
        return;
      }

      const data = await response.json();

      if (data.authenticationToken) {
        document.cookie = `JWT=${data.authenticationToken}; path=/; Secure`;
        localStorage.setItem("haveLoggedIn", "true");
        window.location.reload();
      }

    } catch (error) {
      setServerError("Server connection error — please try again later");
      console.error(error);
    }
  }

  return (
    <>
      <Header />
      <main className="flex flex-col justify-center items-center w-full min-h-full text-center">

        <form onSubmit={handleSubmit} className="flex flex-col h-auto w-80 mt-10">

          {authType === AuthType.REGISTER ? (
            <>
              <h1 className="mb-5 font-bold text-2xl text-center">Create account</h1>

              {/* USERNAME */}
              <div className="mb-3 text-left">
                <input
                  className={`w-full px-5 py-2 rounded-lg text-opposite border-2 ${error.username ? "border-red-500" : "border-gray-300"}`}
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={checkForErrors}
                  onFocus={clearError}
                />
                {error.username && <p className="text-red-500 text-sm mt-1">{error.username}</p>}
              </div>

              {/* EMAIL */}
              <div className="mb-3 text-left">
                <input
                  className={`w-full px-5 py-2 rounded-lg text-opposite border-2 ${error.email ? "border-red-500" : "border-gray-300"}`}
                  type="text"
                  name="email"
                  placeholder="E-mail"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={checkForErrors}
                  onFocus={clearError}
                />
                {error.email && <p className="text-red-500 text-sm mt-1">{error.email}</p>}
              </div>

              {/* PASSWORD */}
              <div className="mb-3 text-left">
                <input
                  className={`w-full px-5 py-2 rounded-lg text-opposite border-2 ${error.password ? "border-red-500" : "border-gray-300"}`}
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={checkForErrors}
                  onFocus={clearError}
                />
                {error.password && <p className="text-red-500 text-sm mt-1">{error.password}</p>}
              </div>

              <button type="submit" className="button mt-2">Sign up</button>
            </>
          ) : (
            <>
              <h1 className="mb-5 font-bold text-2xl text-center">Login</h1>

              {/* USERNAME */}
              <div className="mb-3 text-left">
                <input
                  className={`w-full px-5 py-2 rounded-lg text-opposite border-2 ${error.username ? "border-red-500" : "border-gray-300"}`}
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={checkForErrors}
                  onFocus={clearError}
                />
                {error.username && <p className="text-red-500 text-sm mt-1">{error.username}</p>}
              </div>

              {/* PASSWORD */}
              <div className="mb-3 text-left">
                <input
                  className={`w-full px-5 py-2 rounded-lg text-opposite border-2 ${error.password ? "border-red-500" : "border-gray-300"}`}
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={clearError}
                />
                {error.password && <p className="text-red-500 text-sm mt-1">{error.password}</p>}
              </div>

              <button type="submit" className="button mt-2">Sign in</button>
            </>
          )}

          {/* GLOBAL ERROR */}
          {serverError && (
            <p className="text-red-500 text-sm mt-4 text-center">{serverError}</p>
          )}
        </form>

        <div className="mt-5 cursor-pointer underline" onClick={changeAuthType}>
          {authType === AuthType.REGISTER
            ? <p>Already have an account? Log in</p>
            : <p>Do not have an account? Sign up</p>}
        </div>
      </main>
      <Footer />
    </>
  )
}

```

--- 

## `sub-manager-front-end/src/app/dashboard/dashboard.css`

```css
@import "../globals.css";

.dashboard-nav-item:hover {
    background: var(--secondary) !important;
}

.dashboard-nav-item__active {
    background: var(--primary) !important;
}

.user-button {
    border: 1px solid var(--primary);
}
```

--- 

## `sub-manager-front-end/src/app/dashboard/layout.tsx`

```tsx
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardProvider } from "@/components/dashboard-context"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardProvider>
        <AppSidebar />
        <main className="w-full">
          <SidebarTrigger />
          {children}
        </main>
      </DashboardProvider>
    </SidebarProvider>
  )
}

```

--- 

## `sub-manager-front-end/src/app/dashboard/page.tsx`

```tsx
'use client'

import { useDashboardContext } from "@/components/dashboard-context"
import Overview from "@/components/overview/Overview"
import Subscriptions from "@/components/subscriptions/Subscriptions"
import Payments from "@/components/payments/Payments"
import { useMemo } from "react"

import "./dashboard.css"

export default function Dashboard() {
  const { activeTab } = useDashboardContext()

  const TABS = {
    overview: Overview,
    subscriptions: Subscriptions,
    payments: Payments,
  }

  const ActiveComponent = useMemo(() => TABS[activeTab], [activeTab])

  return (
    <div className="w-full min-h-full dashboard p-4">
      <ActiveComponent />
    </div>
  )
}
```

--- 

## `sub-manager-front-end/src/app/subscription/page.tsx`

```tsx

```

--- 

## `sub-manager-front-end/src/app/subscription/[id]/page.tsx`

```tsx

```

--- 

## `sub-manager-front-end/src/components/app-sidebar.tsx`

```tsx
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { Clock, DollarSign, House, User, LucideIcon, LogOut } from "lucide-react"
import { useDashboardContext } from "@/components/dashboard-context"
import { useEffect, useState } from "react"
import { getUsernameFromCookie, logout } from "@/utils/auth-functions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"

type TabKey = "overview" | "subscriptions" | "payments"

const TABS: Record<TabKey, { label: string; icon: LucideIcon }> = {
    overview: { label: "Overview", icon: House },
    subscriptions: { label: "Subscriptions", icon: DollarSign },
    payments: { label: "Payments", icon: Clock },
}

export function AppSidebar() {
    const { activeTab, setActiveTab } = useDashboardContext()
    const [ username, setUsername ] = useState<string>("")

    useEffect(() => {
        const name = getUsernameFromCookie()
        if (name) setUsername(name)
    }, [])

    const handleTabClick = (key: TabKey) => {
        setActiveTab(key)
        localStorage.setItem('activeTab', key)
    }

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <a href="/">
                                <span className="text-base font-semibold">SubManager</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Dashboard</SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            {(Object.keys(TABS) as TabKey[]).map((key) => {
                                const Icon = TABS[key].icon
                                const isActive = activeTab === key

                                return (
                                    <SidebarMenuItem key={key}>
                                        <SidebarMenuButton
                                            onClick={() => handleTabClick(key)}
                                            className={
                                            "w-full flex items-center gap-2 px-3 py-2 rounded-md transition-all " +
                                            (isActive ? "dashboard-nav-item__active" : "")
                                            }
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span>{TABS[key].label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

             <SidebarFooter>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton className="user-button">
                            <User />
                            <span className="truncate font-medium">{username || "_"}</span>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent side="top" align="end" className="min-w-[160px]">
                        <DropdownMenuItem onClick={logout} className="cursor-pointer flex items-center">
                            <LogOut className="mr-2 ml-2 h-4 w-4" />
                            Wyloguj
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

```

--- 

## `sub-manager-front-end/src/components/dashboard-context.tsx`

```tsx
"use client";

import { Payment, Subscription } from '@/types'
import { getAuthTokenFromCookie, logout } from '@/utils/auth-functions'
import { createContext, useContext, useEffect, useState } from 'react'

type TabKey = "overview" | "subscriptions" | "payments"

interface DashboardContextType {
  activeTab: TabKey
  setActiveTab: (tab: TabKey) => void

  subscriptions: Subscription[] | null
  payments: Payment[] | null
  loadingSubs: boolean
  loadingPays: boolean
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const stored = localStorage.getItem('activeTab') as TabKey | null
    
    if (stored === 'overview' || stored === 'subscriptions' || stored === 'payments') {
      return stored
    }

    return 'overview'
  })

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [payments, setPayments]         = useState<Payment[]>([])
  const [loadingSubs, setLoadingSubs]   = useState<boolean>(true)
  const [loadingPays, setLoadingPays]   = useState<boolean>(true)

  useEffect(() => {
    const token = getAuthTokenFromCookie()
    const URL = 'http://localhost:8080/api/';

    fetch(`${URL}auth/validateToken?token=${token}`)
      .then(r => {
        const isTokenValid = r.ok

        console.log(isTokenValid)

        if(!isTokenValid) {
          logout()
        }
      })
      .catch(console.error)

    fetch(`${URL}subscription`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then((data: Subscription[]) => setSubscriptions(data))
      .catch(console.error)
      .finally(() => setLoadingSubs(false))

    fetch(`${URL}payment`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then((data: Payment[]) => setPayments(data))
      .catch(console.error)
      .finally(() => setLoadingPays(false))
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTab', activeTab)
    }
  }, [activeTab])

  return (
    <DashboardContext.Provider value={{
      activeTab, setActiveTab,
      subscriptions, payments,
      loadingSubs, loadingPays
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboardContext = () => {
  const context = useContext(DashboardContext)
  
  if (!context) {
    throw new Error("useDashboardContext must be used within a DashboardProvider")
  }
  
  return context
}
```

--- 

## `sub-manager-front-end/src/components/footer/Footer.tsx`

```tsx
"use client"

interface FooterProps {}

const Footer: React.FC<FooterProps> = ({}: FooterProps) => {

    function getCurrentYear(): string {
        const currentYear: string = new Date().getFullYear().toString();
        
        return currentYear;
    }

    return (
        <footer className="justify-center items-center hidden md:flex text-sm md:text-base lg:text-lg">
            Made with love &#9829; by Gabriel Gałęza &copy; {getCurrentYear()}
        </footer>
    )
}

export default Footer; 
```

--- 

## `sub-manager-front-end/src/components/footer/__tests__/Footer.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer component', () => {
  it('should render the footer with the correct text', () => {
    render(<Footer />);

    expect(screen.getByText(/Made with love/i)).toBeInTheDocument();

    expect(screen.getByText(/by Gabriel Gałęza/i)).toBeInTheDocument();
    
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear, 'i'))).toBeInTheDocument();
  });
});
```

--- 

## `sub-manager-front-end/src/components/header/Header.tsx`

```tsx
"use client"

import { logout } from "@/utils/auth-functions";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HeaderProps {
}

const Header: React.FC<HeaderProps> = ({}: HeaderProps) => {

  const [isLogin, setIsLogin] = useState(getAuthTokenFromCookie() ? true : false);

  function getAuthTokenFromCookie() {
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('JWT='));
    
    return cookie ? cookie.split('=')[1] : null;
  }



  return (
    <header className="flex items-center justify-around border-b-slate-500">
        <h1 className="header-logo font-bold text-lg md:text-xl lg:text-2xl">
          <Link href="/">
            <img src="/Logo.svg" alt="Logo" />
          </Link>
        </h1>
        <div className="header-links flex justify-between items-center text-sm md:text-base">
            {isLogin === false 
            ? 
            <Link href="/auth">
              <div className="header-links--link header-links--link__featured p-3">Login</div>
            </Link>
            :
            <>
              <div onClick={logout} className="button-secondary">Logout!</div>
            </>  
            }
        </div>
    </header>
  );
};

export default Header;
```

--- 

## `sub-manager-front-end/src/components/overview/Overview.tsx`

```tsx
"use client"

import { Area, AreaChart, CartesianGrid, Label, Pie, PieChart, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useDashboardContext } from "../dashboard-context"
import { useMemo } from "react"
import { generateGreenShades } from "@/utils/get-colors"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--accent-secondary)",
  },
  spend: {
    label: "Spend",
    color: "var(--primary)",
  },
  remaining: {
    label: "Remaining",
    color: "var(--accent-secondary)",
  },
} satisfies ChartConfig

const target = 4000 // przykładowy budżet

export default function Overview() {
  const { payments, subscriptions } = useDashboardContext()
  const currentYear = new Date().getFullYear()

  const monthlyData = useMemo(() => {
    if (!payments || !subscriptions) return []

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString("en", { month: "long" }),
      total: 0,
    }))

    payments.forEach((p) => {
      const date = new Date(p.dateOfPayment)
      if (isNaN(date.getTime()) || date.getFullYear() !== currentYear) return

      const sub = subscriptions.find((s) => s.subscriptionId === p.subscriptionId)
      const price = sub?.price ?? 0
      const monthIndex = date.getMonth()
      months[monthIndex].total += price
    })

    return months
  }, [payments, subscriptions, currentYear])

  // 🔹 Suma wszystkich płatności
  const totalSpend = useMemo(() => {
    return monthlyData.reduce((sum, d) => sum + d.total, 0)
  }, [monthlyData])

  // 🔹 Dane do kołowego wykresu
  const pieData = [
    { name: "Spend", value: totalSpend, fill: "var(--primary)" },
    {
      name: "Remaining",
      value: target - totalSpend > 0 ? target - totalSpend : 0,
      fill: "var(--secondary)",
    },
  ]

  // 🔹 Obliczenia z oryginalnego kodu
  const perMonth = subscriptions?.reduce((sum, sub) => {
    if (sub.cycle === "MONTHLY") {
      return sum + sub.price
    }
    return sum + sub.price / 12
  }, 0)

  const paymentsThisYear = useMemo(() => {
    if (!payments) return []
    return payments.filter((p) => {
      const d = new Date(p.dateOfPayment)
      return !isNaN(d.getTime()) && d.getFullYear() === currentYear
    })
  }, [payments, currentYear])

  const overallYear = useMemo(() => {
    if (!subscriptions) return 0
    return paymentsThisYear.reduce((sum, pay) => {
      const sub = subscriptions.find((s) => s.subscriptionId === pay.subscriptionId)
      return sum + (sub?.price ?? 0)
    }, 0)
  }, [paymentsThisYear, subscriptions])

  const overallAllTime = useMemo(() => {
    if (!payments || !subscriptions) return 0
    return payments.reduce((sum, pay) => {
      const sub = subscriptions.find((s) => s.subscriptionId === pay.subscriptionId)
      return sum + (sub?.price ?? 0)
    }, 0)
  }, [payments, subscriptions])

  return (
    <div className="w-full p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Overview</h2>

      <div className="w-full grid grid-rows-[2fr_1fr] gap-6">
        <div className="w-full flex gap-6">
          {/* AreaChart - dynamiczne dane */}
          <Card className="w-1/2 bg-[var(--sidebar-background)] border-[var(--accent)]">
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={monthlyData}
                  margin={{ left: 12, right: 12 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Area
                    dataKey="total"
                    type="linear"
                    fill="var(--secondary)"
                    fillOpacity={0.8}
                    stroke="var(--primary)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* 🔹 PieChart — udział subskrypcji */}
          <Card className="w-1/2 bg-[var(--sidebar-background)] border-[var(--accent)]">
            <CardHeader>
              <CardTitle>Subscriptions share</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="w-full h-full max-h-[250px]"
              >
                {subscriptions && subscriptions.length > 0 ? (
                  (() => {
                    // 🔸 przelicz miesięczne wartości
                    const subsWithMonthlyValue = subscriptions.map((s) => ({
                      name: s.title || "Unknown",
                      value: s.cycle === "YEARLY" ? s.price / 12 : s.price,
                    }))

                    const total = subsWithMonthlyValue.reduce(
                      (sum, s) => sum + s.value,
                      0
                    )

                    const greenShades = generateGreenShades(subsWithMonthlyValue.length)
                    const pieData = subsWithMonthlyValue.map((s, i) => ({
                      ...s,
                      fill: greenShades[i],
                    }))

                    return (
                      <PieChart width={0} height={250} className="max-h-[250px]">
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="60%"
                          outerRadius="90%"
                          strokeWidth={4}
                        >
                          <Label
                            content={({ viewBox }) => {
                              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                  <text
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                  >
                                    <tspan
                                      x={viewBox.cx}
                                      y={viewBox.cy}
                                      className="fill-foreground text-3xl font-bold"
                                    >
                                      {total.toFixed(2)} zł
                                    </tspan>
                                    <tspan
                                      x={viewBox.cx}
                                      y={(viewBox.cy || 0) + 22}
                                      className="fill-muted-foreground text-sm"
                                    >
                                      total monthly
                                    </tspan>
                                  </text>
                                )
                              }
                            }}
                          />
                        </Pie>
                      </PieChart>
                    )
                  })()
                ) : (
                  <div className="text-muted-foreground text-center py-10">
                    No active subscriptions
                  </div>
                )}
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Dolne boxy */}
        <div className="w-full flex gap-6">
          <Card className="w-1/4 bg-[var(--sidebar-background)] border-[var(--accent)]">
            <CardHeader>
              <CardTitle>Active subscriptions:</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[var(--primary)]">
                {subscriptions?.length}
              </span>
            </CardContent>
          </Card>

          <Card className="w-1/4 bg-[var(--sidebar-background)] border-[var(--accent)]">
            <CardHeader>
              <CardTitle>Current usage:</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[var(--primary)]">
                {perMonth?.toFixed(2)}zł/month
              </span>
            </CardContent>
          </Card>

          <Card className="w-1/4 bg-[var(--sidebar-background)] border-[var(--accent)]">
            <CardHeader>
              <CardTitle>Overall this year</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[var(--primary)]">
                {overallYear?.toFixed(2)}zł
              </span>
              <span className="text-sm text-muted-foreground">
                spend in {currentYear}
              </span>
            </CardContent>
          </Card>

          <Card className="w-1/4 bg-[var(--sidebar-background)] border-[var(--accent)]">
            <CardHeader>
              <CardTitle>Overall all time</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[var(--primary)]">
                {overallAllTime?.toFixed(2)}zł
              </span>
              <span className="text-sm text-muted-foreground">
                spend on subscriptions
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

```

--- 

## `sub-manager-front-end/src/components/payments/payments-table.tsx`

```tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Payment, Status, Subscription } from "@/types"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AlertDialogFooter, AlertDialogHeader } from "../ui/alert-dialog";
import { useState } from "react";
import { getAuthTokenFromCookie } from "@/utils/auth-functions";

export function PaymentsTable({ payments, subscriptions }: { payments: Payment[] | null, subscriptions: Subscription[] | null}) {
    const [open, setOpen] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
    const [data, setData] = useState<Payment[]>(payments ?? []);

    if (payments === null || subscriptions === null) {
        return "detseta";
    } 

    const sortedData = [...payments].sort((a, b) => {
        if (a.status == Status.UNPROCESSED && b.status != Status.UNPROCESSED) return -1
        if (a.status != Status.UNPROCESSED && b.status == Status.UNPROCESSED) return 1

        return 0;
    })

    const isUnprocessed = (status: Payment['status']) => String(status) === "UNPROCESSED";

    const confirmProcess = async () => {
        if (!selectedPaymentId) return;
        const URL = 'http://localhost:8080/api/';
        const token = getAuthTokenFromCookie()
        
        try {
            const res = await fetch(`${URL}payment/${selectedPaymentId}/process`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                 },
            });

            if (!res.ok) throw new Error('Network response was not ok');

            setData((prev) =>
                prev.map((p) =>
                    p.paymentId === selectedPaymentId ? { ...p, status: Status.PAID } : p
                )
            );

        } catch (error) {
            console.error('Failed to process payment:', error);
            alert('Failed to update payment status. Please try again.');
        } finally {
            setOpen(false);
            setSelectedPaymentId(null);
        }
    };

    return (
        <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Date of payment</TableHead>
                <TableHead>Status</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {sortedData.map((pay) => {
                const statusIsUnprocessed = isUnprocessed(pay.status);

                return ( 
                    <TableRow key={pay.paymentId}>
                        <TableCell>{subscriptions.find(sub => sub.subscriptionId === pay.subscriptionId)?.title}</TableCell>
                        <TableCell>{subscriptions.find(sub => sub.subscriptionId === pay.subscriptionId)?.price} zł</TableCell>
                        <TableCell>{new Date(pay.dateOfPayment).toLocaleDateString()}</TableCell>
                        <TableCell>
                            {statusIsUnprocessed ? (
                                <AlertDialog open={open} onOpenChange={setOpen}>
                                <AlertDialogTrigger
                                    asChild
                                    onClick={() => setSelectedPaymentId(pay.paymentId)}
                                    >
                                    <button className="px-2 py-1 rounded bg-[var(--primary)] text-white hover:bg-[var(--secondary)]">
                                    Process
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Processing</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to mark this payment as PAID? (This action cannot be undo)
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-red-500 text-white hover:bg-red-700:">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={confirmProcess} className="bg-blue-500 text-white hover:bg-blue-700:" >
                                        Confirm
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>
                            ) : (
                                <span>{pay.status}</span>
                            )}
                        </TableCell>
                    </TableRow>
                )
            })}
        </TableBody>
        </Table>
    )
}

```

--- 

## `sub-manager-front-end/src/components/payments/Payments.tsx`

```tsx
"use client"

import { PaymentsTable } from "./payments-table"
import { useDashboardContext } from "../dashboard-context"

export default function Payments() {

    const {payments, subscriptions, loadingPays} = useDashboardContext()

    return (
        <>
            <h2 className="text-xl font-semibold">Your Payments</h2>
            <PaymentsTable payments={payments} subscriptions={subscriptions} />
        </>
    )
}
```

--- 

## `sub-manager-front-end/src/components/subscriptions/AddSubscriptionForm.tsx`

```tsx
"use client";

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAuthTokenFromCookie } from "@/utils/auth-functions"

const formSchema = z.object({
  title:             z.string().min(1, "Title is required"),
  description:       z.string().optional(),
  price:             z.number().positive("Price must be grater then 0"),
  cycle:             z.enum(["MONTHLY", "YEARLY"]),
  dateOfLastPayment: z.date().refine(d => d instanceof Date, "Date is required"),
  currencyId:        z.literal(1),
})

type FormValues = z.infer<typeof formSchema>

export default function AddSubscriptionForm() {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title:             "",
      description:       "",
      price:             0,
      cycle:             "MONTHLY",
      dateOfLastPayment: new Date(),
      currencyId:        1,
    },
  })

  const selectedDate = watch("dateOfLastPayment")

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const token = getAuthTokenFromCookie()
      const res = await fetch("http://localhost:8080/api/subscription", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          Authorization:   `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          dateOfLastPayment: format(data.dateOfLastPayment, "yyyy-MM-dd"),
        }),
      })
      if (!res.ok) throw new Error("Błąd serwera")
      reset()  // resetujemy wszystkie pola do defaultValues
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h2 className="text-xl font-semibold">Add Subscription</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        {/* Nazwa */}
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Opis */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register("description")} />
        </div>

        {/* Cena */}
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>

        {/* Cykl */}
        <div>
          <Label htmlFor="cycle">Cycle</Label>
          <Select
            defaultValue="MONTHLY"
            onValueChange={(val: "MONTHLY" | "YEARLY") =>
              setValue("cycle", val, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz cykl" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.cycle && (
            <p className="text-sm text-red-500">{errors.cycle.message}</p>
          )}
        </div>

        {/* Data ostatniej płatności */}
        <div className="flex flex-col gap-1">
          <Label>Date of last payment</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate
                  ? format(selectedDate, "yyyy-MM-dd")
                  : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setValue("dateOfLastPayment", date, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              }}
              required
            />
            </PopoverContent>
          </Popover>
          {errors.dateOfLastPayment && (
            <p className="text-sm text-red-500">
              {errors.dateOfLastPayment.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" className="bg-[var(--primary)] text-white hover:bg-[var(--secondary)]" disabled={loading}>
          {loading ? "Sending..." : "Add subscription"}
        </Button>
      </form>
    </>
  )
}

```

--- 

## `sub-manager-front-end/src/components/subscriptions/subscriptions-table.tsx`

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Subscription } from "@/types"
import { Button } from "../ui/button"
import { useState } from "react"
import { Trash2 } from "lucide-react"
import { getAuthTokenFromCookie } from "@/utils/auth-functions"

export function SubscriptionsTable({ data, onDelete }: { data: Subscription[], onDelete?: (id: number) => void } ) {

  const [loadingId, setLoadingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tę subskrypcję?")) return

    try {
      setLoadingId(id)
      const token = getAuthTokenFromCookie()
      const res = await fetch(`http://localhost:8080/api/subscription/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Nie udało się usunąć subskrypcji.")

      // jeśli przekazano callback odświeżenia listy
      if (onDelete) onDelete(id)
      else window.location.reload()
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setLoadingId(null)
    }
  }



  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Cycle</TableHead>
          <TableHead>Last Payment</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((sub) => (
          <TableRow key={sub.subscriptionId}>
            <TableCell>{sub.title}</TableCell>
            <TableCell>{sub.description}</TableCell>
            <TableCell>{sub.price} zł</TableCell>
            <TableCell>{sub.cycle}</TableCell>
            <TableCell>{new Date(sub.dateOfLastPayment).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(sub.subscriptionId)}
                disabled={loadingId === sub.subscriptionId}
              >
                {loadingId === sub.subscriptionId ? "Usuwanie..." : <Trash2 className="w-4 h-4" />}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

```

--- 

## `sub-manager-front-end/src/components/subscriptions/Subscriptions.tsx`

```tsx
"use client"

import { getAuthTokenFromCookie } from "@/utils/auth-functions";
import { useEffect, useState } from "react";
import { SubscriptionsTable } from "./subscriptions-table";
import { Skeleton } from "../ui/skeleton";
import { Pagination } from "../ui/pagination";
import AddSubscriptionForm from "./AddSubscriptionForm";
import { Subscription } from "@/types";

const PAGE_SIZE = 10

export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const [page, setPage] = useState(1)

    useEffect(() => {
        const token = getAuthTokenFromCookie()

        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:8080/api/subscription', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                const data: Subscription[] = await res.json()
                setSubscriptions(data)
                setLoading(false)
            } catch (err) {
                console.error("Błąd podczas pobierania subskrypcji:", err)
                setLoading(false)
            }
        }
        
        fetchData()
    }, [])


    const totalPages = Math.ceil(subscriptions.length / PAGE_SIZE)
    const currentItems = subscriptions.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    )

    return (
        <div className="space-y-6">
            <AddSubscriptionForm />

            <h2 className="text-xl font-semibold">Your Subscriptions</h2>

            {loading ? (
                <div className="space-y-2">
                {[...Array(PAGE_SIZE)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                ))}
                </div>
            ) : (
                <>
                <SubscriptionsTable data={currentItems} />
                <div className="flex justify-center pt-4">
                    <Pagination/>
                </div>
                </>
            )}
        </div>
    )
}
```

--- 

## `sub-manager-front-end/src/components/ui/alert-dialog.tsx`

```tsx
"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}

```

--- 

## `sub-manager-front-end/src/components/ui/button.tsx`

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

```

--- 

## `sub-manager-front-end/src/components/ui/calendar.tsx`

```tsx
"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "bg-popover absolute inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-[--cell-size] select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day
        ),
        range_start: cn(
          "bg-accent rounded-l-md",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-[--cell-size] items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-[--cell-size] flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }

```

--- 

## `sub-manager-front-end/src/components/ui/card.tsx`

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

```

--- 

## `sub-manager-front-end/src/components/ui/chart.tsx`

```tsx
"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item?.dataKey || item?.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload
            .filter((item) => item.type !== "none")
            .map((item, index) => {
              const key = `${nameKey || item.name || item.dataKey || "value"}`
              const itemConfig = getPayloadConfigFromPayload(config, item, key)
              const indicatorColor = color || item.payload.fill || item.color

              return (
                <div
                  key={item.dataKey}
                  className={cn(
                    "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                    indicator === "dot" && "items-center"
                  )}
                >
                  {formatter && item?.value !== undefined && item.name ? (
                    formatter(item.value, item.name, item, index, item.payload)
                  ) : (
                    <>
                      {itemConfig?.icon ? (
                        <itemConfig.icon />
                      ) : (
                        !hideIndicator && (
                          <div
                            className={cn(
                              "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                              {
                                "h-2.5 w-2.5": indicator === "dot",
                                "w-1": indicator === "line",
                                "w-0 border-[1.5px] border-dashed bg-transparent":
                                  indicator === "dashed",
                                "my-0.5": nestLabel && indicator === "dashed",
                              }
                            )}
                            style={
                              {
                                "--color-bg": indicatorColor,
                                "--color-border": indicatorColor,
                              } as React.CSSProperties
                            }
                          />
                        )
                      )}
                      <div
                        className={cn(
                          "flex flex-1 justify-between leading-none",
                          nestLabel ? "items-end" : "items-center"
                        )}
                      >
                        <div className="grid gap-1.5">
                          {nestLabel ? tooltipLabel : null}
                          <span className="text-muted-foreground">
                            {itemConfig?.label || item.name}
                          </span>
                        </div>
                        {item.value && (
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {item.value.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref
  ) => {
    const { config } = useChart()

    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload
          .filter((item) => item.type !== "none")
          .map((item) => {
            const key = `${nameKey || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)

            return (
              <div
                key={item.value}
                className={cn(
                  "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
                )}
              >
                {itemConfig?.icon && !hideIcon ? (
                  <itemConfig.icon />
                ) : (
                  <div
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                )}
                {itemConfig?.label}
              </div>
            )
          })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegend"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}

```

--- 

## `sub-manager-front-end/src/components/ui/dropdown-menu.tsx`

```tsx
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}

```

--- 

## `sub-manager-front-end/src/components/ui/input.tsx`

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

```

--- 

## `sub-manager-front-end/src/components/ui/label.tsx`

```tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }

```

--- 

## `sub-manager-front-end/src/components/ui/pagination.tsx`

```tsx
import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}

```

--- 

## `sub-manager-front-end/src/components/ui/popover.tsx`

```tsx
"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-popover-content-transform-origin]",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }

```

--- 

## `sub-manager-front-end/src/components/ui/select.tsx`

```tsx
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}

```

--- 

## `sub-manager-front-end/src/components/ui/separator.tsx`

```tsx
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }

```

--- 

## `sub-manager-front-end/src/components/ui/sheet.tsx`

```tsx
"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}

```

--- 

## `sub-manager-front-end/src/components/ui/sidebar.tsx`

```tsx
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }

        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      },
      [setOpenProp, open]
    )

    // Helper to toggle the sidebar.
    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open)
    }, [isMobile, setOpen, setOpenMobile])

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContextProps>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Sidebar</SheetTitle>
              <SheetDescription>Displays the mobile sidebar.</SheetDescription>
            </SheetHeader>
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div
        ref={ref}
        className="group peer hidden text-sidebar-foreground md:block"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
      >
        {/* This is what handles the sidebar gap on desktop */}
        <div
          className={cn(
            "relative w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[side=right]:rotate-180",
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
          )}
        />
        <div
          className={cn(
            "fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            // Adjust the padding for floating and inset variants.
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
            className
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
})
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex w-full flex-1 flex-col bg-background",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = "SidebarInput"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("w-full text-sm", className)}
    {...props}
  />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state } = useSidebar()

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    )

    if (!tooltip) {
      return button
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      }
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== "collapsed" || isMobile}
          {...tooltip}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground",
      "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
      "peer-data-[size=sm]/menu-button:top-1",
      "peer-data-[size=default]/menu-button:top-1.5",
      "peer-data-[size=lg]/menu-button:top-2.5",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuBadge.displayName = "SidebarMenuBadge"

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = false, ...props }, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-[--skeleton-width] flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ ...props }, ref) => <li ref={ref} {...props} />)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}

```

--- 

## `sub-manager-front-end/src/components/ui/skeleton.tsx`

```tsx
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  )
}

export { Skeleton }

```

--- 

## `sub-manager-front-end/src/components/ui/table.tsx`

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

```

--- 

## `sub-manager-front-end/src/components/ui/textarea.tsx`

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }

```

--- 

## `sub-manager-front-end/src/components/ui/tooltip.tsx`

```tsx
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

```

--- 

## `sub-manager-front-end/src/hooks/use-mobile.tsx`

```tsx
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

```

--- 

## `sub-manager-front-end/src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```

--- 

## `sub-manager-front-end/src/utils/auth-functions.ts`

```typescript
export function getAuthTokenFromCookie(): string | null {
    const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('JWT='));

    return cookie ? cookie.split('=')[1] : null;
}

export function getUsernameFromCookie(): string | null {
    const token = getAuthTokenFromCookie()
    if (!token) return null

    try {
        const payloadBase64 = token.split('.')[1]
        const payloadJson = atob(payloadBase64)
        const payload = JSON.parse(payloadJson)

        return payload.sub || null
    } catch (error) {
        console.error("Error while decoding JWT:", error)
        return null
    }
}

export function logout() {
    document.cookie = "JWT=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    window.location.reload();
}
```

--- 

## `sub-manager-front-end/src/utils/get-colors.ts`

```typescript
export const generateGreenShades = (count: number) => {
    const colors: string[] = []
    const primary = [93, 214, 44] // #5dd62c
    const secondary = [51, 116, 24] // #337418

    for (let i = 0; i < count; i++) {
      const ratio = count === 1 ? 0.5 : i / (count - 1)
      const r = Math.round(secondary[0] + (primary[0] - secondary[0]) * ratio)
      const g = Math.round(secondary[1] + (primary[1] - secondary[1]) * ratio)
      const b = Math.round(secondary[2] + (primary[2] - secondary[2]) * ratio)
      colors.push(`rgb(${r}, ${g}, ${b})`)
    }
    return colors
}
```


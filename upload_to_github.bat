@echo off
echo Starting GitHub Upload Process...
cd /d d:\fproject

REM Remove nested .git if exists (optional but recommended)
if exist "my-app\.git" (
    echo Removing nested .git in my-app...
    rmdir /s /q "my-app\.git"
)

echo Initializing local Git repository...
git init

echo Adding remote origin...
git remote add origin https://github.com/NatthathidaBoonta/fproject.git

echo Adding files...
git add .

echo Committing...
git commit -m "Initial commit from Antigravity AI"

echo Setting branch to main...
git branch -M main

echo Pushing to GitHub...
echo (You might need to login in the popup window)
git push -u origin main

echo Process completed!
pause

.PHONY: test

default: help

compile:
	@npm run compile

deploy:
	@npm run deploy

dev:
	@npm run dev

test:
	@npm run test

push:
	@git push origin dev

help:
	@echo "   \033[35mmake\033[0m \033[1m命令使用说明\033[0m"
	@echo "   \033[35mmake test\033[0m\t\033[0m\t---  运行测试"
	@echo "   \033[35mmake dev\033[0m\t\033[0m\t---  开发"
	@echo "   \033[35mmake deploy\033[0m\t\033[0m\t---  部署合约"
	@echo "   \033[35mmake push\033[0m\t\033[0m\t---  提交代码到dev分支"
	@echo "   \033[35mmake compile\033[0m\t\033[0m\t---  编译合约源码，生成bytecode和ABI"
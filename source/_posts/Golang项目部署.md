---
title: Golang项目部署
categories: 运维
tags: Golang
abbrlink: 36933
date: 2022-07-16 18:12:13
---

此博客提供了三种方案，可以根据项目需求适当选择

<!-- more -->

### 前言
Golang项目部署流程：编译——>上传到服务器——>运行。
简单的实现方案有：本地编译上传部署，构建docker镜像部署，自动化docker镜像部署
### 1、本地编译上传部署
>注：在本地（window环镜）编译，需修改Go语言的环境配置
>命令：go env -w GOOS=linux

```
//在项目根目录执行,生成二进制文件server
go build -o server .
//上传到服务器，22为服务端口，/xxx为服务器目录
scp -P 22 server root@ip:/xxx
//在服务器切换到文件目录
cd /xxx
//运行二进制文件
nohup ./server >start.log 2>&1 &

//查看日志
tail -f 200 start.log
```
### 2、构建docker镜像部署
* 在项目根目录创建Dockerfile文件
```
# 第一阶段构建编译环境
FROM golang:alpine AS builder

WORKDIR /project/go
COPY . .
RUN go env -w GOPROXY=https://goproxy.cn,direct \
    && go env -w GO111MODULE=on \
    && go generate && go env && go build -o server .
# 第二阶段构建运行环境，alpine为linux轻量级发行版
FROM alpine:latest

WORKDIR /project/go

COPY --from=builder /project/go ./
//暴露的端口号
EXPOSE 8888
//容器运行时执行，直接运行二进制文件，防止容器挂掉
CMD ./server

```
* 创建shell脚本文件go.sh（简化部署步骤）
```
#!/bin/bash
# 镜像名字
IMAGE_NAME=centos7_go_database

# docker容器名字
CONTAINER_NAME=go

#编译好的二进制文件
SERVER_NAME=server

#使用说明，用来提示输入参数X
usage() {
    echo "Usage: sh 执行脚本.sh [start]"
    exit 1
}

  
#构建镜像和并启动容器(在宿主机执行)
start(){

  #容器id
  CID=$(docker ps -a | grep "$CONTAINER_NAME" | awk '{print $1}')

  #镜像id
  IID=$(docker images | grep "$IMAGE_NAME" | awk '{print $3}')

  # 构建docker镜像
  if [ -n "$IID" ]; then

    echo "Exit $IMAGE_NAME image，IID=$IID"

  else

    echo "NOT exit $IMAGE_NAME image，start build image..."

    # 根据项目个路径下的Dockerfile文件，构建镜像

    docker build -t $IMAGE_NAME .

    echo "$IMAGE_NAME image has been builded"

  fi
  if [ -n "$CID" ]; then

      echo "Exit $CONTAINER_NAME container，CID=$CID.   ---Remove container"

      docker stop $CONTAINER_NAME   # 停止运行中的容器

      docker rm $CONTAINER_NAME     ##删除原来的容器
  fi

  # 构建容器
  echo "$CONTAINER_NAME container,start build..."
  # 运行容器

   # --name 容器的名字

   #   -d   容器后台运行

   #   -p   指定容器映射的端口和主机对应的端口

   #   -v   将主机的目录挂载到容器的目录中（不可少）

  docker run -e TZ="Asia/Shanghai" -p 8888:8888 -id --name $CONTAINER_NAME -v $PWD:/project/$CONTAINER_NAME $IMAGE_NAME
  echo "$CONTAINER_NAME container build end"
}


#根据输入参数，选择执行对应方法，不输入则执行使用说明

case "$1" in
  "start")
    start
    ;;
  *)
    usage
    ;;

esac
```
* 开始部署
```
sh go.sh start
```

### 3、自动化docker镜像部署
此自动化方案是基于阿里云效代码平台的流水线功能实现的，实现的效果：当有master分支有完成合并请求时执行（和其他的方案大同小异，思想可以借鉴）
* 创建流水线选择模板

![](https://fastly.jsdelivr.net/gh/zglgithubx/picture/img/202207161736015.png)

* 测试步骤可以根据需要进行删改
* 点击流水线源，编辑流水线源
	* 开启代码出发——>合并请求完成后
	* 设置工作目录：api
* 编辑构建步骤
	* 选择构建集群（可以查看官方教程）
	* 选择下载部分流水线源
	* 流水线源选择仓库代码
	* 构建命令：
```
#切换到流水线的工作目录
cd /root/workspace/api

#编译项目文件，此步骤是在平台进行项目编译，可以选择不编译，因为在Dockerfile中已经有编译的步骤
go env -w GOPROXY=https://goproxy.cn,direct \&& go env -w GO111MODULE=on \&& go env -w CGO_ENABLED=0 \&& go generate && go env && go build -o server .

```
	* 构建物上传，打包路径为./ 此打包路径指打包项目根目录下所有文件
* 编辑部署步骤
	* 下载路径：下载到服务器的文件目录，需要提前创建
	* 执行用户：root
	* 部署脚本：
```
#解压项目二进制压缩包（构建物上传时直接将压缩包上传到了下载路径）
tar zxvf 下载路径 -C 解压目录

#切换到项目目录
cd 解压目录

#执行脚本文件
sh go.sh start
```

自此完成部署